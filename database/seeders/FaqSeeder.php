<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            ['How do I pay?', 'We accept Cash on Delivery, bKash, Nagad, SSLCommerz, aamarPay, and more depending on admin settings.'],
            ['What is the delivery time?', 'Inside Dhaka metro: 1–3 business days. Outside Dhaka: 3–7 business days.'],
            ['Can I return a product?', 'Yes — request a return from your account order page for eligible delivered orders.'],
            ['Is Cash on Delivery available?', 'Yes, COD is available nationwide where our couriers operate.'],
        ];

        foreach ($faqs as $i => $faq) {
            Faq::query()->updateOrCreate(
                ['question' => $faq[0]],
                ['answer' => $faq[1], 'sort_order' => $i, 'is_active' => true]
            );
        }
    }
}
