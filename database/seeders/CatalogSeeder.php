<?php

namespace Database\Seeders;

use App\Domain\Enums\ProductStatus;
use App\Domain\Enums\ProductType;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $electronics = Category::query()->create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $fashion = Category::query()->create([
            'name' => 'Fashion',
            'slug' => 'fashion',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        Category::query()->create([
            'name' => 'Mobile Phones',
            'slug' => 'mobile-phones',
            'parent_id' => $electronics->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $samsung = Brand::query()->create(['name' => 'Samsung', 'slug' => 'samsung', 'is_active' => true]);
        $walton = Brand::query()->create(['name' => 'Walton', 'slug' => 'walton', 'is_active' => true]);
        $aarong = Brand::query()->create(['name' => 'Aarong', 'slug' => 'aarong', 'is_active' => true]);

        $mobileCat = Category::query()->where('slug', 'mobile-phones')->first();

        $products = [
            [
                'name' => 'Samsung Galaxy A55 5G',
                'slug' => 'samsung-galaxy-a55',
                'sku' => 'SKU-SAM-A55',
                'category_id' => $mobileCat?->id,
                'brand_id' => $samsung->id,
                'short_description' => '6.6" Super AMOLED, 50MP camera, 5000mAh battery',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 42999,
                'compare_price' => 45999,
                'stock_quantity' => 25,
                'low_stock_threshold' => 5,
                'is_featured' => true,
            ],
            [
                'name' => 'Walton NexG N25',
                'slug' => 'walton-nexg-n25',
                'sku' => 'SKU-WAL-N25',
                'category_id' => $mobileCat?->id,
                'brand_id' => $walton->id,
                'short_description' => 'Made in Bangladesh smartphone',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 14999,
                'compare_price' => 16999,
                'stock_quantity' => 3,
                'low_stock_threshold' => 5,
                'is_featured' => true,
            ],
            [
                'name' => 'Aarong Cotton Panjabi',
                'slug' => 'aarong-cotton-panjabi',
                'sku' => 'SKU-AAR-PAN',
                'category_id' => $fashion->id,
                'brand_id' => $aarong->id,
                'short_description' => 'Premium cotton panjabi for Eid',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 3500,
                'stock_quantity' => 50,
                'is_featured' => false,
            ],
            [
                'name' => 'Digital Gift Card ৳1000',
                'slug' => 'digital-gift-card-1000',
                'sku' => 'SKU-GIFT-1K',
                'category_id' => $electronics->id,
                'short_description' => 'Instant digital delivery',
                'type' => ProductType::Digital,
                'status' => ProductStatus::Published,
                'price' => 1000,
                'stock_quantity' => 999,
                'track_inventory' => false,
            ],
            [
                'name' => 'Wireless Earbuds Pro',
                'slug' => 'wireless-earbuds-pro',
                'sku' => 'SKU-EAR-PRO',
                'category_id' => $electronics->id,
                'brand_id' => $samsung->id,
                'short_description' => 'ANC wireless earbuds',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Draft,
                'price' => 4999,
                'stock_quantity' => 0,
                'low_stock_threshold' => 3,
            ],
        ];

        $placeholders = [
            'samsung-galaxy-a55' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop',
            'walton-nexg-n25' => 'https://images.unsplash.com/photo-1598327105666-5b817fb7e8af?w=600&h=600&fit=crop',
            'aarong-cotton-panjabi' => 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
            'wireless-earbuds-pro' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
        ];

        foreach ($products as $data) {
            $product = Product::query()->create($data);

            if (isset($placeholders[$product->slug])) {
                ProductImage::query()->create([
                    'product_id' => $product->id,
                    'path' => $placeholders[$product->slug],
                    'alt' => $product->name,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }

            if ($product->slug === 'aarong-cotton-panjabi') {
                $product->variants()->createMany([
                    ['name' => 'Size M', 'sku' => 'SKU-PAN-M', 'price' => 3490, 'stock_quantity' => 12, 'attributes' => ['size' => 'M'], 'is_active' => true],
                    ['name' => 'Size L', 'sku' => 'SKU-PAN-L', 'price' => 3490, 'stock_quantity' => 8, 'attributes' => ['size' => 'L'], 'is_active' => true],
                    ['name' => 'Size XL', 'sku' => 'SKU-PAN-XL', 'price' => 3590, 'stock_quantity' => 5, 'attributes' => ['size' => 'XL'], 'is_active' => true],
                ]);
            }
        }
    }
}
