<?php

namespace Database\Seeders;

use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentMethod;
use App\Domain\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class SampleOrdersSeeder extends Seeder
{
    public function run(): void
    {
        if (Order::query()->count() > 0) {
            return;
        }

        $customer = User::query()->where('email', 'customer@arcommerze.test')->first();
        $products = Product::query()->published()->limit(4)->get();

        if ($products->isEmpty()) {
            return;
        }

        $statuses = [
            OrderStatus::Delivered,
            OrderStatus::Delivered,
            OrderStatus::Confirmed,
            OrderStatus::Processing,
            OrderStatus::Pending,
            OrderStatus::Shipped,
        ];

        $methods = [PaymentMethod::Cod, PaymentMethod::Bkash, PaymentMethod::Cod];

        for ($i = 0; $i < 18; $i++) {
            $product = $products->random();
            $qty = random_int(1, 2);
            $subtotal = (float) $product->price * $qty;
            $shipping = $subtotal >= 2000 ? 0 : 80;
            $total = $subtotal + $shipping;
            $status = $statuses[array_rand($statuses)];
            $method = $methods[array_rand($methods)];
            $createdAt = now()->subDays(random_int(0, 28))->subHours(random_int(0, 12));

            $order = Order::query()->create([
                'order_number' => 'AC-DEMO-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'user_id' => $i % 3 === 0 ? $customer?->id : null,
                'guest_name' => $i % 3 === 0 ? null : 'Guest Customer '.($i + 1),
                'guest_phone' => '017'.random_int(10000000, 99999999),
                'status' => $status,
                'payment_status' => in_array($status, [OrderStatus::Delivered, OrderStatus::Shipped])
                    ? PaymentStatus::Paid
                    : PaymentStatus::Pending,
                'payment_method' => $method,
                'subtotal' => $subtotal,
                'shipping_amount' => $shipping,
                'total' => $total,
                'shipping_address' => [
                    'name' => 'Demo Customer',
                    'phone' => '01700000000',
                    'address_line_1' => 'House 12, Road 5',
                    'city' => 'Dhaka',
                    'district' => 'Dhaka',
                ],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
                'paid_at' => in_array($status, [OrderStatus::Delivered, OrderStatus::Shipped]) ? $createdAt : null,
            ]);

            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'quantity' => $qty,
                'unit_price' => $product->price,
                'total' => $subtotal,
            ]);

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'status' => OrderStatus::Pending,
                'note' => 'Order placed',
                'created_at' => $createdAt,
            ]);
        }
    }
}
