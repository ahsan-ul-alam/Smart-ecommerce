<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Header navigation
            ['location' => 'header', 'label' => 'All Products', 'url' => '/shop/products'],
            ['location' => 'header', 'label' => 'Featured', 'url' => '/shop/products?featured=1'],
            ['location' => 'header', 'label' => 'Flash Sale', 'url' => '/shop/flash-sales'],
            ['location' => 'header', 'label' => 'Track Order', 'url' => '/shop/track'],
            ['location' => 'header', 'label' => 'Contact', 'url' => '/shop/contact'],

            // Footer — Shop column
            ['location' => 'footer_shop', 'label' => 'All Products', 'url' => '/shop/products'],
            ['location' => 'footer_shop', 'label' => 'Featured', 'url' => '/shop/products?featured=1'],
            ['location' => 'footer_shop', 'label' => 'Cart', 'url' => '/shop/cart'],

            // Footer — Support column
            ['location' => 'footer_support', 'label' => 'Track Order', 'url' => '/shop/track'],
            ['location' => 'footer_support', 'label' => 'FAQ', 'url' => '/shop/faq'],
            ['location' => 'footer_support', 'label' => 'Contact', 'url' => '/shop/contact'],
        ];

        foreach ($items as $index => $item) {
            MenuItem::query()->updateOrCreate(
                ['location' => $item['location'], 'label' => $item['label']],
                [
                    'url' => $item['url'],
                    'sort_order' => $index,
                    'is_active' => true,
                    'open_in_new_tab' => false,
                ],
            );
        }
    }
}
