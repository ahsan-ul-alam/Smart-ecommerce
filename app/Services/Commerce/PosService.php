<?php

namespace App\Services\Commerce;

use App\Domain\Enums\InventoryMovementType;
use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentMethod;
use App\Domain\Enums\PaymentStatus;
use App\Domain\Enums\ProductStatus;
use App\Events\OrderPlaced;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Catalog\ProductService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PosService
{
    public function __construct(
        protected ProductService $productService,
        protected OrderService $orderService,
        protected VendorCommissionService $vendorCommissions,
    ) {}

    public function createOrder(array $data, int $staffUserId): Order
    {
        $items = $data['items'] ?? [];

        if (empty($items)) {
            throw ValidationException::withMessages(['items' => 'Add at least one product.']);
        }

        $paymentMethod = PaymentMethod::from($data['payment_method'] ?? 'cod');
        $discount = max(0, (float) ($data['discount'] ?? 0));

        return DB::transaction(function () use ($items, $data, $discount, $paymentMethod, $staffUserId) {
            $lineItems = [];
            $subtotal = 0;

            foreach ($items as $row) {
                $product = Product::query()
                    ->with('variants')
                    ->where('id', $row['product_id'])
                    ->where('status', ProductStatus::Published)
                    ->firstOrFail();

                $variant = ! empty($row['product_variant_id'])
                    ? ProductVariant::query()->where('product_id', $product->id)->find($row['product_variant_id'])
                    : null;

                $qty = max(1, (int) ($row['quantity'] ?? 1));
                $stock = $variant ? $variant->stock_quantity : $product->stock_quantity;

                if ($product->track_inventory && $stock < $qty) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for {$product->name}.",
                    ]);
                }

                $unitPrice = (float) ($variant?->price ?? $product->price);
                $lineTotal = $unitPrice * $qty;
                $subtotal += $lineTotal;

                $lineItems[] = compact('product', 'variant', 'qty', 'unitPrice', 'lineTotal');
            }

            $total = max(0, $subtotal - $discount);

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'source' => 'pos',
                'created_by' => $staffUserId,
                'user_id' => $data['user_id'] ?? null,
                'guest_name' => $data['customer_name'] ?? 'Walk-in Customer',
                'guest_phone' => $data['customer_phone'] ?? null,
                'guest_email' => $data['customer_email'] ?? null,
                'status' => OrderStatus::Confirmed,
                'payment_status' => PaymentStatus::Paid,
                'payment_method' => $paymentMethod,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'shipping_amount' => 0,
                'tax_amount' => 0,
                'total' => $total,
                'shipping_address' => [
                    'name' => $data['customer_name'] ?? 'Walk-in Customer',
                    'phone' => $data['customer_phone'] ?? 'N/A',
                    'address_line_1' => 'In-store pickup',
                    'city' => 'Dhaka',
                    'district' => 'Dhaka',
                    'country' => 'Bangladesh',
                ],
                'paid_at' => now(),
                'admin_note' => $data['note'] ?? 'POS sale',
            ]);

            foreach ($lineItems as $row) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $row['product']->id,
                    'product_variant_id' => $row['variant']?->id,
                    'product_name' => $row['product']->name,
                    'product_sku' => $row['variant']?->sku ?? $row['product']->sku,
                    'variant_name' => $row['variant']?->name,
                    'quantity' => $row['qty'],
                    'unit_price' => $row['unitPrice'],
                    'total' => $row['lineTotal'],
                ]);

                if ($row['product']->track_inventory) {
                    if ($row['variant']) {
                        $row['variant']->update([
                            'stock_quantity' => max(0, $row['variant']->stock_quantity - $row['qty']),
                        ]);
                    } else {
                        $this->productService->adjustStock(
                            $row['product'],
                            $row['qty'],
                            InventoryMovementType::Out,
                            "POS #{$order->order_number}",
                            $staffUserId
                        );
                    }
                }
            }

            $this->orderService->recordPosStatus($order, $staffUserId);

            $order = $order->load('items');
            $this->vendorCommissions->recordForOrder($order);
            OrderPlaced::dispatch($order);

            return $order;
        });
    }

    protected function generateOrderNumber(): string
    {
        do {
            $number = 'POS-'.now()->format('ymd').'-'.strtoupper(substr(uniqid(), -5));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }
}
