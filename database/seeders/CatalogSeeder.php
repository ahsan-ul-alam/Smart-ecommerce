<?php

namespace Database\Seeders;

use App\Domain\Enums\ProductStatus;
use App\Domain\Enums\ProductType;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'sort_order' => 1],
            ['name' => 'Fashion', 'slug' => 'fashion', 'sort_order' => 2],
            ['name' => 'Home & Living', 'slug' => 'home-living', 'sort_order' => 3],
            ['name' => 'Beauty', 'slug' => 'beauty', 'sort_order' => 4],
            ['name' => 'Sports', 'slug' => 'sports', 'sort_order' => 5],
            ['name' => 'Groceries', 'slug' => 'groceries', 'sort_order' => 6],
        ];

        $categoryIds = [];
        foreach ($categories as $data) {
            $category = Category::query()->create([
                ...$data,
                'is_active' => true,
            ]);
            $categoryIds[$data['slug']] = $category->id;
        }

        $brands = [
            'Samsung',
            'Walton',
            'Aarong',
            'Xiaomi',
            'Apple',
            'Nike',
            'Unilever',
            'Philips',
        ];

        $brandIds = [];
        foreach ($brands as $name) {
            $brand = Brand::query()->create([
                'name' => $name,
                'slug' => Str::slug($name),
                'is_active' => true,
            ]);
            $brandIds[Str::slug($name)] = $brand->id;
        }

        $products = [
            [
                'name' => 'Samsung Galaxy A55 5G',
                'slug' => 'samsung-galaxy-a55',
                'sku' => 'SKU-SAM-A55',
                'category_id' => $categoryIds['electronics'],
                'brand_id' => $brandIds['samsung'],
                'short_description' => '6.6" Super AMOLED, 50MP camera, 5000mAh battery',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 42999,
                'compare_price' => 45999,
                'stock_quantity' => 25,
                'low_stock_threshold' => 5,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop',
            ],
            [
                'name' => 'Walton NexG N25',
                'slug' => 'walton-nexg-n25',
                'sku' => 'SKU-WAL-N25',
                'category_id' => $categoryIds['electronics'],
                'brand_id' => $brandIds['walton'],
                'short_description' => 'Made in Bangladesh smartphone',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 14999,
                'compare_price' => 16999,
                'stock_quantity' => 3,
                'low_stock_threshold' => 5,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1598327105666-5b817fb7e8af?w=600&h=600&fit=crop',
            ],
            [
                'name' => 'Aarong Cotton Panjabi',
                'slug' => 'aarong-cotton-panjabi',
                'sku' => 'SKU-AAR-PAN',
                'category_id' => $categoryIds['fashion'],
                'brand_id' => $brandIds['aarong'],
                'short_description' => 'Premium cotton panjabi for Eid',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 3500,
                'stock_quantity' => 50,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
                'variants' => true,
            ],
            [
                'name' => 'Xiaomi Redmi Note 13',
                'slug' => 'xiaomi-redmi-note-13',
                'sku' => 'SKU-XIA-RN13',
                'category_id' => $categoryIds['electronics'],
                'brand_id' => $brandIds['xiaomi'],
                'short_description' => '108MP camera, 67W fast charging',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 24999,
                'compare_price' => 26999,
                'stock_quantity' => 18,
                'low_stock_threshold' => 5,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
            ],
            [
                'name' => 'Apple AirPods Pro',
                'slug' => 'apple-airpods-pro',
                'sku' => 'SKU-APL-AIRPODS',
                'category_id' => $categoryIds['electronics'],
                'brand_id' => $brandIds['apple'],
                'short_description' => 'Active noise cancellation earbuds',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 28999,
                'compare_price' => 31999,
                'stock_quantity' => 12,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop',
            ],
            [
                'name' => 'Nike Revolution 7 Running Shoes',
                'slug' => 'nike-revolution-7',
                'sku' => 'SKU-NKE-REV7',
                'category_id' => $categoryIds['sports'],
                'brand_id' => $brandIds['nike'],
                'short_description' => 'Lightweight everyday running shoes',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 6999,
                'compare_price' => 7999,
                'stock_quantity' => 30,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
            ],
            [
                'name' => 'Philips LED Bulb Pack (4 pcs)',
                'slug' => 'philips-led-bulb-pack',
                'sku' => 'SKU-PHI-LED4',
                'category_id' => $categoryIds['home-living'],
                'brand_id' => $brandIds['philips'],
                'short_description' => '9W energy-saving LED bulbs',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 899,
                'stock_quantity' => 100,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&h=600&fit=crop',
            ],
            [
                'name' => 'Unilever Lifebuoy Soap Pack',
                'slug' => 'unilever-lifebuoy-soap',
                'sku' => 'SKU-UNI-LIFE',
                'category_id' => $categoryIds['groceries'],
                'brand_id' => $brandIds['unilever'],
                'short_description' => 'Family pack antibacterial soap',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Published,
                'price' => 320,
                'stock_quantity' => 200,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop',
            ],
            [
                'name' => 'Digital Gift Card ৳1000',
                'slug' => 'digital-gift-card-1000',
                'sku' => 'SKU-GIFT-1K',
                'category_id' => $categoryIds['electronics'],
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
                'category_id' => $categoryIds['electronics'],
                'brand_id' => $brandIds['samsung'],
                'short_description' => 'ANC wireless earbuds',
                'type' => ProductType::Physical,
                'status' => ProductStatus::Draft,
                'price' => 4999,
                'stock_quantity' => 0,
                'low_stock_threshold' => 3,
                'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
            ],
        ];

        foreach ($products as $data) {
            $image = $data['image'] ?? null;
            $hasVariants = $data['variants'] ?? false;
            unset($data['image'], $data['variants']);

            $product = Product::query()->create($data);

            if ($image) {
                ProductImage::query()->create([
                    'product_id' => $product->id,
                    'path' => $image,
                    'alt' => $product->name,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }

            if ($hasVariants) {
                $product->variants()->createMany([
                    ['name' => 'Size M', 'sku' => 'SKU-PAN-M', 'price' => 3490, 'stock_quantity' => 12, 'attributes' => ['size' => 'M'], 'is_active' => true],
                    ['name' => 'Size L', 'sku' => 'SKU-PAN-L', 'price' => 3490, 'stock_quantity' => 8, 'attributes' => ['size' => 'L'], 'is_active' => true],
                    ['name' => 'Size XL', 'sku' => 'SKU-PAN-XL', 'price' => 3590, 'stock_quantity' => 5, 'attributes' => ['size' => 'XL'], 'is_active' => true],
                ]);
            }
        }
    }
}
