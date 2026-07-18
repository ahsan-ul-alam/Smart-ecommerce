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

/**
 * Fills the catalog with enough realistic products for the storefront layouts
 * (6-up homepage rows, catalog grid, category pages) to render as designed.
 * Deterministic (idempotent) so it can be re-run without duplicating or churning data.
 */
class ExtraProductsSeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = Category::query()->pluck('id', 'slug');
        $brandIds = Brand::query()->pluck('id')->values()->all();

        if ($categoryIds->isEmpty() || empty($brandIds)) {
            return; // CatalogSeeder must run first.
        }

        // name pools + [min, max] price range per category
        $catalog = [
            'electronics' => [[1500, 45000], [
                'Wireless Mouse', 'Mechanical Keyboard', '65W USB-C Charger', 'Bluetooth Speaker',
                '4K Action Camera', 'Smart Watch Series X', 'Power Bank 20000mAh', 'Portable SSD 1TB',
                'Full HD Webcam', 'Gaming Headset',
            ]],
            'fashion' => [[800, 6500], [
                'Slim Fit Denim Jeans', 'Cotton Casual Shirt', 'Handloom Saree', 'Leather Wallet',
                'Formal Blazer', 'Summer Maxi Dress', 'Sports T-Shirt', 'Winter Hoodie',
                'Silk Scarf', 'Ankle Boots',
            ]],
            'home-living' => [[500, 9000], [
                'Ceramic Dinner Set', 'Memory Foam Pillow', 'Table Lamp', 'Non-stick Cookware Set',
                'Minimalist Wall Clock', 'Cotton Bedsheet Set', 'Woven Storage Basket', 'Scented Candle Set',
                'Wooden Coffee Table', 'Curtain Panel Pair',
            ]],
            'beauty' => [[300, 4500], [
                'Vitamin C Serum', 'Matte Lipstick', 'Facial Cleanser', 'Sunscreen SPF 50',
                'Ionic Hair Dryer', 'Signature Perfume 100ml', 'Moisturizing Cream', 'Eyeshadow Palette',
                'Beard Grooming Kit', 'Nail Polish Set',
            ]],
            'sports' => [[400, 8000], [
                'Anti-slip Yoga Mat', 'Adjustable Dumbbell', 'Running Shorts', 'Football Size 5',
                'Tennis Cricket Bat', 'Cycling Helmet', 'Resistance Band Set', 'Steel Water Bottle 1L',
                'Badminton Racket', 'Training Gym Gloves',
            ]],
            'groceries' => [[150, 1800], [
                'Premium Basmati Rice 5kg', 'Organic Honey 500g', 'Pure Mustard Oil 1L', 'Green Tea 100 Bags',
                'Mixed Nuts 500g', 'Olive Oil 750ml', 'Instant Coffee Jar', 'Whole Wheat Atta 2kg',
                'Dark Chocolate Pack', 'Red Lentils 1kg',
            ]],
        ];

        $i = 0;
        foreach ($catalog as $slug => [$range, $names]) {
            $categoryId = $categoryIds[$slug] ?? null;
            if (! $categoryId) {
                continue;
            }

            [$min, $max] = $range;
            $count = count($names);

            foreach ($names as $n => $name) {
                $i++;
                $productSlug = Str::slug($name).'-'.$slug;

                // Deterministic price spread across the category range.
                $price = (int) round(($min + ($max - $min) * ($n / max(1, $count - 1))) / 10) * 10;

                $onSale = $i % 3 === 0;
                $freeShipping = $i % 5 === 0;
                $customCharge = (! $freeShipping && $i % 7 === 0) ? 150 : null;
                $stock = $i % 9 === 0 ? 0 : ($i % 6 === 0 ? 4 : (($i * 7) % 60) + 10);

                $product = Product::query()->updateOrCreate(
                    ['slug' => $productSlug],
                    [
                        'name' => $name,
                        'sku' => 'SKU-EX-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                        'category_id' => $categoryId,
                        'brand_id' => $brandIds[$i % count($brandIds)],
                        'short_description' => $name.' — quality picked for everyday value.',
                        'type' => ProductType::Physical,
                        'status' => ProductStatus::Published,
                        'price' => $price,
                        'compare_price' => $onSale ? (int) round($price * 1.2) : null,
                        'stock_quantity' => $stock,
                        'low_stock_threshold' => 5,
                        'track_inventory' => true,
                        'is_featured' => $i % 4 === 0,
                        'free_shipping' => $freeShipping,
                        'shipping_charge' => $customCharge,
                    ],
                );

                ProductImage::query()->updateOrCreate(
                    ['product_id' => $product->id],
                    [
                        'path' => "https://picsum.photos/seed/{$productSlug}/600/600",
                        'alt' => $name,
                        'is_primary' => true,
                        'sort_order' => 0,
                    ],
                );
            }
        }
    }
}
