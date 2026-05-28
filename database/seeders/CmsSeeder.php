<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\BlogPost;
use App\Models\HomepageSection;
use App\Models\Page;
use App\Models\Vendor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        HomepageSection::query()->updateOrCreate(
            ['type' => 'hero', 'sort_order' => 1],
            [
                'title' => 'Shop Smart, Pay Easy',
                'subtitle' => 'Cash on Delivery across Bangladesh. Fast delivery, trusted products.',
                'link' => '/shop/products',
                'button_text' => 'Browse Products',
                'is_active' => true,
            ]
        );

        HomepageSection::query()->updateOrCreate(
            ['type' => 'trust_badges', 'sort_order' => 99],
            [
                'title' => 'Trust badges',
                'content' => json_encode([
                    ['Cash on Delivery', 'Pay when you receive your order'],
                    ['Free Shipping', 'On orders over ৳2,000'],
                    ['Easy Returns', 'Hassle-free return policy'],
                ]),
                'is_active' => true,
            ]
        );

        Vendor::query()->updateOrCreate(
            ['slug' => 'arcommerze-store'],
            ['name' => 'ArCommerze Store', 'email' => 'vendor@arcommerze.test', 'commission_rate' => 0, 'is_active' => true]
        );

        Banner::query()->updateOrCreate(
            ['title' => 'Eid Sale'],
            ['image' => null, 'link' => '/shop/products', 'position' => 'homepage', 'sort_order' => 1, 'is_active' => true]
        );

        $admin = User::query()->where('email', 'admin@arcommerze.test')->first();

        foreach ([
            ['slug' => 'about-us', 'title' => 'About Us', 'content' => "ArCommerze is a Bangladesh-focused eCommerce platform built for single-vendor stores with local payments, couriers, and marketing tools."],
            ['slug' => 'privacy-policy', 'title' => 'Privacy Policy', 'content' => "We respect your privacy. Contact us for data requests or account deletion."],
            ['slug' => 'terms', 'title' => 'Terms & Conditions', 'content' => "By placing an order you agree to our shipping, return, and payment policies."],
        ] as $page) {
            Page::query()->updateOrCreate(
                ['slug' => $page['slug']],
                ['title' => $page['title'], 'content' => $page['content'], 'is_published' => true]
            );
        }

        BlogPost::query()->updateOrCreate(
            ['slug' => 'welcome-to-arcommerze'],
            [
                'user_id' => $admin?->id,
                'title' => 'Welcome to ArCommerze',
                'excerpt' => 'Bangladesh smart eCommerce platform launch.',
                'content' => 'We are excited to bring enterprise-grade eCommerce to Bangladesh.',
                'is_published' => true,
                'published_at' => now(),
            ]
        );
    }
}
