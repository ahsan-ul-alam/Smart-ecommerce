<?php

namespace App\Services\Commerce;

use App\Domain\Enums\InventoryMovementType;
use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentMethod;
use App\Domain\Enums\PaymentStatus;
use App\Domain\Enums\ProductStatus;
use App\Events\OrderPlaced as OrderPlacedEvent;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SpecialProduct;
use App\Services\Catalog\ProductService;
use App\Services\Marketing\CampaignService;
use App\Services\Marketing\FlashSaleService;
use App\Services\Settings\SettingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SpecialProductOrderService
{
    public function __construct(
        protected FlashSaleService $flashSales,
        protected ProductService $productService,
        protected ShippingZoneService $shippingZones,
        protected CampaignService $campaigns,
        protected SettingService $settings,
        protected OrderService $orders,
    ) {}

    public function previewTotals(Product $product, ?ProductVariant $variant, int $quantity, ?string $district): array
    {
        $this->flashSales->hydrateCache([$product->id]);

        $unitPrice = $this->unitPrice($product, $variant);
        $subtotal = round($unitPrice * $quantity, 2);

        $campaignDiscount = $this->campaigns->scheduledDiscount($subtotal);
        $discount = $campaignDiscount;
        $taxable = max(0, $subtotal - $discount);

        $shippingResult = $this->shippingZones->calculate($taxable, $district, true);
        $shipping = $shippingResult['shipping'];
        $tax = $this->calculateTax($taxable);
        $total = max(0, $taxable + $shipping + $tax);

        return [
            'subtotal' => $subtotal,
            'discount' => round($discount, 2),
            'shipping' => round($shipping, 2),
            'tax' => $tax,
            'tax_label' => $this->taxLabel(),
            'total' => round($total, 2),
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'shipping_zone' => $shippingResult['zone'],
            'free_shipping_min' => $shippingResult['free_shipping_min'],
        ];
    }

    public function createOrder(SpecialProduct $page, array $checkout, bool $deductStock = true): Order
    {
        $product = $page->product;

        if (! $product || $product->status !== ProductStatus::Published) {
            throw ValidationException::withMessages(['product' => 'This product is not available.']);
        }

        $quantity = max(1, (int) ($checkout['quantity'] ?? 1));
        $variant = $this->resolveVariant($product, $checkout['variant_id'] ?? null);

        $this->flashSales->hydrateCache([$product->id]);
        $this->flashSales->assertCanPurchase($product, $quantity);

        $stock = $variant ? $variant->stock_quantity : $product->stock_quantity;
        if ($product->track_inventory && $stock < $quantity) {
            throw ValidationException::withMessages(['quantity' => 'Insufficient stock for this product.']);
        }

        $district = $checkout['shipping_address']['district'] ?? null;
        $totals = $this->previewTotals($product, $variant, $quantity, $district);
        $unitPrice = $totals['unit_price'];
        $paymentMethod = PaymentMethod::from($checkout['payment_method'] ?? 'cod');

        return DB::transaction(function () use ($page, $product, $variant, $quantity, $unitPrice, $totals, $checkout, $paymentMethod, $deductStock) {
            $order = Order::query()->create([
                'order_number' => $this->orders->generateOrderNumber(),
                'source' => 'special_product',
                'special_product_id' => $page->id,
                'user_id' => $checkout['user_id'] ?? null,
                'guest_name' => $checkout['guest_name'] ?? null,
                'guest_email' => $checkout['guest_email'] ?? null,
                'guest_phone' => $checkout['guest_phone'] ?? null,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Pending,
                'payment_method' => $paymentMethod,
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount'],
                'shipping_amount' => $totals['shipping'],
                'tax_amount' => $totals['tax'],
                'total' => $totals['total'],
                'shipping_address' => $checkout['shipping_address'],
                'billing_address' => $checkout['shipping_address'],
                'customer_note' => $checkout['customer_note'] ?? null,
            ]);

            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'product_name' => $product->name,
                'product_sku' => $variant?->sku ?? $product->sku,
                'variant_name' => $variant?->name,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total' => round($unitPrice * $quantity, 2),
            ]);

            if ($deductStock && $product->track_inventory) {
                if ($variant) {
                    $variant->decrement('stock_quantity', $quantity);
                } else {
                    $this->productService->adjustStock(
                        $product,
                        $quantity,
                        InventoryMovementType::Out,
                        "Offer order #{$order->order_number}",
                        $checkout['user_id'] ?? null,
                    );
                }
            }

            $this->flashSales->recordOrderSales($order);

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'status' => OrderStatus::Pending,
                'note' => 'Order placed via special product landing',
                'user_id' => $checkout['user_id'] ?? null,
            ]);

            event(new OrderPlacedEvent($order));

            return $order->fresh(['items']);
        });
    }

    protected function resolveVariant(Product $product, ?int $variantId): ?ProductVariant
    {
        $product->loadMissing('variants');
        $active = $product->variants->where('is_active', true);

        if ($active->isEmpty()) {
            return null;
        }

        if (! $variantId) {
            throw ValidationException::withMessages(['variant_id' => 'Please select a product option.']);
        }

        $variant = $active->firstWhere('id', $variantId);

        if (! $variant) {
            throw ValidationException::withMessages(['variant_id' => 'Invalid product option.']);
        }

        return $variant;
    }

    protected function unitPrice(Product $product, ?ProductVariant $variant): float
    {
        if ($variant?->price) {
            return (float) $variant->price;
        }

        return $this->flashSales->effectivePrice($product);
    }

    protected function calculateTax(float $taxable): float
    {
        $rate = (float) $this->settings->get('tax_rate', 0);

        return round($taxable * ($rate / 100), 2);
    }

    protected function taxLabel(): string
    {
        $rate = (float) $this->settings->get('tax_rate', 0);

        return $rate > 0 ? "VAT ({$rate}%)" : 'VAT';
    }
}
