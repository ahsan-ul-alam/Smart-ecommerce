<?php

namespace App\Services\Commerce;

use App\Domain\Enums\InventoryMovementType;
use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentMethod;
use App\Domain\Enums\PaymentStatus;
use App\Models\Cart;
use App\Events\OrderPlaced as OrderPlacedEvent;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Services\Catalog\ProductService;
use App\Services\Customer\LoyaltyService;
use App\Services\Customer\WalletService;
use App\Services\Marketing\FlashSaleService;
use App\Services\Marketing\AffiliateService;
use App\Services\Marketing\ReferralService;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        protected CartService $cartService,
        protected ProductService $productService,
        protected FlashSaleService $flashSales,
        protected LoyaltyService $loyalty,
        protected WalletService $wallet,
        protected ReferralService $referrals,
        protected AffiliateService $affiliates,
        protected VendorCommissionService $vendorCommissions,
    ) {}

    public function createFromCart(Cart $cart, array $checkoutData, bool $deductStock = true): Order
    {
        $cart->load(['items.product.variants', 'items.variant', 'coupon']);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
        }

        $this->flashSales->hydrateCache($cart->items->pluck('product_id')->all());

        foreach ($cart->items as $item) {
            $product = $item->product;
            if ($product->status !== \App\Domain\Enums\ProductStatus::Published) {
                throw ValidationException::withMessages(['cart' => "{$product->name} is no longer available."]);
            }
            $variant = $item->variant;
            $stock = $variant ? $variant->stock_quantity : $product->stock_quantity;
            if ($product->track_inventory && $stock < $item->quantity) {
                throw ValidationException::withMessages(['cart' => "Insufficient stock for {$product->name}."]);
            }
            $this->flashSales->assertCanPurchase($product, $item->quantity);
        }

        $user = isset($checkoutData['user_id'])
            ? User::query()->find($checkoutData['user_id'])
            : null;

        $district = $checkoutData['shipping_address']['district'] ?? null;

        $totals = $user
            ? $this->cartService->calculateTotalsWithRewards(
                $cart,
                $user,
                (int) ($checkoutData['loyalty_points'] ?? 0),
                (float) ($checkoutData['wallet_amount'] ?? 0),
                $district,
            )
            : $this->cartService->calculateTotals($cart, $district);

        $paymentMethod = PaymentMethod::from($checkoutData['payment_method'] ?? 'cod');

        return DB::transaction(function () use ($cart, $checkoutData, $totals, $paymentMethod, $deductStock, $user) {
            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $checkoutData['user_id'] ?? null,
                'guest_name' => $checkoutData['guest_name'] ?? null,
                'guest_email' => $checkoutData['guest_email'] ?? null,
                'guest_phone' => $checkoutData['guest_phone'] ?? null,
                'status' => OrderStatus::Pending,
                'payment_status' => $paymentMethod === PaymentMethod::Cod
                    ? PaymentStatus::Pending
                    : PaymentStatus::Pending,
                'payment_method' => $paymentMethod,
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount'],
                'loyalty_points_used' => $totals['loyalty_points'] ?? 0,
                'loyalty_discount' => $totals['loyalty_discount'] ?? 0,
                'wallet_amount_used' => $totals['wallet_used'] ?? 0,
                'shipping_amount' => $totals['shipping'],
                'tax_amount' => $totals['tax'],
                'total' => $totals['total'],
                'coupon_id' => $cart->coupon_id,
                'coupon_code' => $cart->coupon?->code,
                'shipping_address' => $checkoutData['shipping_address'],
                'billing_address' => $checkoutData['billing_address'] ?? $checkoutData['shipping_address'],
                'customer_note' => $checkoutData['customer_note'] ?? null,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'product_sku' => $item->variant?->sku ?? $item->product->sku,
                    'variant_name' => $item->variant?->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->lineTotal(),
                ]);

                if ($deductStock && $item->product->track_inventory) {
                    if ($item->variant) {
                        $this->deductVariantStock($item->variant, $item->quantity);
                    } else {
                        $this->productService->adjustStock(
                            $item->product,
                            $item->quantity,
                            InventoryMovementType::Out,
                            "Order #{$order->order_number}",
                            $checkoutData['user_id'] ?? null
                        );
                    }
                }
            }

            if ($cart->coupon) {
                $cart->coupon->increment('used_count');
            }

            $this->flashSales->recordOrderSales($order);

            if ($user) {
                if (($totals['loyalty_points'] ?? 0) > 0) {
                    $this->loyalty->redeem($user, $totals['loyalty_points'], $order);
                }
                if (($totals['wallet_used'] ?? 0) > 0) {
                    $this->wallet->debit($user, $totals['wallet_used'], $order);
                }
            }

            $this->recordStatus($order, OrderStatus::Pending, 'Order placed', $checkoutData['user_id'] ?? null);

            $cart->items()->delete();
            $cart->update(['coupon_id' => null]);

            $order = $order->load(['items', 'statusHistories']);

            if ($paymentMethod === PaymentMethod::Cod || ! in_array($paymentMethod->value, ['bkash', 'nagad', 'sslcommerz', 'aamarpay', 'stripe', 'paypal'], true)) {
                $this->loyalty->earnForOrder($order);
                $this->referrals->rewardOnFirstOrder($order);
                $this->affiliates->recordCommission($order);
                $this->vendorCommissions->recordForOrder($order);
                OrderPlacedEvent::dispatch($order);
            }

            return $order;
        });
    }

    public function updateStatus(Order $order, OrderStatus $status, ?string $note = null, ?int $userId = null): Order
    {
        $order->update([
            'status' => $status,
            'delivered_at' => $status === OrderStatus::Delivered ? now() : $order->delivered_at,
        ]);

        if ($status === OrderStatus::Delivered && $order->payment_method === PaymentMethod::Cod) {
            $order->update(['payment_status' => PaymentStatus::Paid, 'paid_at' => now()]);
        }

        $this->recordStatus($order, $status, $note, $userId);

        return $order->fresh(['items', 'statusHistories', 'user']);
    }

    public function updatePaymentStatus(Order $order, PaymentStatus $status): Order
    {
        $order->update([
            'payment_status' => $status,
            'paid_at' => $status === PaymentStatus::Paid ? now() : null,
        ]);

        return $order->fresh();
    }

    public function confirmPayment(Order $order, ?string $trxId = null): Order
    {
        $order->update([
            'payment_status' => PaymentStatus::Paid,
            'payment_reference' => $trxId ?? $order->payment_reference,
            'paid_at' => now(),
            'status' => OrderStatus::Confirmed,
        ]);

        $order->load('items.product');

        foreach ($order->items as $item) {
            if (! $item->product?->track_inventory) {
                continue;
            }
            if ($item->product_variant_id) {
                $variant = ProductVariant::query()->find($item->product_variant_id);
                if ($variant) {
                    $this->deductVariantStock($variant, $item->quantity);
                }
            } else {
                $this->productService->adjustStock(
                    $item->product,
                    $item->quantity,
                    InventoryMovementType::Out,
                    "Payment confirmed #{$order->order_number}",
                    $order->user_id
                );
            }
        }

        $this->recordStatus($order, OrderStatus::Confirmed, 'Payment received'.($trxId ? " ({$trxId})" : ''), null);

        $order = $order->fresh();
        $this->loyalty->earnForOrder($order);
        $this->referrals->rewardOnFirstOrder($order);
        $this->affiliates->recordCommission($order);
        $this->vendorCommissions->recordForOrder($order);

        return $order;
    }

    public function recordPosStatus(Order $order, int $staffUserId): void
    {
        $this->recordStatus($order, OrderStatus::Confirmed, 'POS sale completed', $staffUserId);
    }

    protected function recordStatus(Order $order, OrderStatus $status, ?string $note, ?int $userId): void
    {
        OrderStatusHistory::query()->create([
            'order_id' => $order->id,
            'user_id' => $userId,
            'status' => $status,
            'note' => $note,
        ]);
    }

    protected function deductVariantStock(ProductVariant $variant, int $quantity): void
    {
        $variant->update([
            'stock_quantity' => max(0, $variant->stock_quantity - $quantity),
        ]);
    }

    public function generateOrderNumber(): string
    {
        do {
            $number = 'AC-'.now()->format('ymd').'-'.strtoupper(substr(uniqid(), -6));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }

    public function recordPartialRefund(Order $order, float $amount, ?string $note, int $userId): Order
    {
        $amount = round(min($amount, (float) $order->total - (float) $order->refunded_amount), 2);
        if ($amount <= 0) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'amount' => 'Refund amount must be greater than zero and not exceed remaining balance.',
            ]);
        }

        $newRefunded = (float) $order->refunded_amount + $amount;
        $order->update(['refunded_amount' => $newRefunded]);

        if ($newRefunded >= (float) $order->total) {
            $this->updatePaymentStatus($order, PaymentStatus::Refunded);
            $this->updateStatus($order, OrderStatus::Refunded, $note ?? 'Full refund processed', $userId);
        } else {
            $this->recordStatus($order, $order->status, $note ?? "Partial refund ৳{$amount}", $userId);
        }

        return $order->fresh();
    }

    public function getStats(): array
    {
        $validToday = Order::query()
            ->whereDate('created_at', today())
            ->whereNotIn('status', [OrderStatus::Cancelled, OrderStatus::Refunded]);

        return [
            'orders_today' => (clone $validToday)->count(),
            'revenue_today' => (float) (clone $validToday)->sum('total'),
            'pending_orders' => Order::query()->where('status', OrderStatus::Pending)->count(),
            'total_orders' => Order::query()->count(),
            'revenue_month' => (float) Order::query()
                ->whereNotIn('status', [OrderStatus::Cancelled, OrderStatus::Refunded])
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('total'),
        ];
    }
}
