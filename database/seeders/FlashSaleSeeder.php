<?php

namespace Database\Seeders;

use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Database\Seeder;

class FlashSaleSeeder extends Seeder
{
    public function run(): void
    {
        $sale = FlashSale::query()->updateOrCreate(
            ['slug' => 'eid-mega-flash'],
            [
                'title' => 'Eid Mega Flash Sale',
                'description' => 'Limited-time discounts on bestsellers. Hurry before stock runs out!',
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(7),
                'is_active' => true,
            ]
        );

        $products = [
            'samsung-galaxy-a55' => 39999,
            'walton-nexg-n25' => 11999,
            'aarong-cotton-panjabi' => 2800,
        ];

        $sync = [];
        foreach ($products as $slug => $salePrice) {
            $product = Product::query()->where('slug', $slug)->first();
            if ($product) {
                $sync[$product->id] = [
                    'sale_price' => $salePrice,
                    'max_quantity' => 50,
                    'sold_count' => 0,
                ];
            }
        }

        $sale->products()->sync($sync);
    }
}
