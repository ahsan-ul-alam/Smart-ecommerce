<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class CatalogImageSeeder extends Seeder
{
    public function run(): void
    {
        $placeholders = [
            'samsung-galaxy-a55' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop',
            'walton-nexg-n25' => 'https://images.unsplash.com/photo-1598327105666-5b817fb7e8af?w=600&h=600&fit=crop',
            'aarong-cotton-panjabi' => 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
            'wireless-earbuds-pro' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
        ];

        foreach ($placeholders as $slug => $url) {
            $product = Product::query()->where('slug', $slug)->first();
            if (! $product || $product->images()->exists()) {
                continue;
            }

            ProductImage::query()->create([
                'product_id' => $product->id,
                'path' => $url,
                'alt' => $product->name,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
