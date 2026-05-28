<?php

namespace Database\Seeders;

use App\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = app(SettingRepositoryInterface::class);

        foreach ([
            'site_name' => 'ArCommerze',
            'site_tagline' => 'Bangladesh Smart eCommerce',
            'currency' => 'BDT',
            'currency_symbol' => '৳',
            'timezone' => 'Asia/Dhaka',
            'store_phone' => '+880 1XXX-XXXXXX',
            'store_email' => 'hello@arcommerze.test',
            'store_address' => 'Dhaka, Bangladesh',
        ] as $key => $value) {
            $settings->set('general', $key, $value);
            \App\Models\Setting::query()->where('group', 'general')->where('key', $key)->update(['is_public' => true]);
        }
        $settings->set('general', 'maintenance_mode', false, 'boolean');

        $settings->setMany('commerce', [
            'shipping_charge' => ['value' => 80, 'type' => 'integer'],
            'free_shipping_min' => ['value' => 2000, 'type' => 'integer'],
            'loyalty_points_per_100' => ['value' => 10, 'type' => 'integer'],
            'loyalty_point_value' => ['value' => 1, 'type' => 'float'],
            'loyalty_min_redeem' => ['value' => 100, 'type' => 'integer'],
            'referral_reward_amount' => ['value' => 50, 'type' => 'float'],
            'referral_reward_type' => ['value' => 'wallet', 'type' => 'string'],
            'affiliate_commission_rate' => ['value' => 5, 'type' => 'float'],
        ]);

        $settings->setMany('theme', [
            'primary_color' => ['value' => '#0f766e', 'type' => 'string'],
            'secondary_color' => ['value' => '#f59e0b', 'type' => 'string'],
            'logo' => ['value' => null, 'type' => 'string'],
            'favicon' => ['value' => null, 'type' => 'string'],
            'dark_mode_default' => ['value' => false, 'type' => 'boolean'],
        ]);

        $settings->setMany('notifications', [
            'email_order_confirmation' => ['value' => true, 'type' => 'boolean'],
            'sms_order_confirmation' => ['value' => true, 'type' => 'boolean'],
            'abandoned_cart_email' => ['value' => true, 'type' => 'boolean'],
            'abandoned_cart_sms' => ['value' => false, 'type' => 'boolean'],
            'low_stock_alert' => ['value' => true, 'type' => 'boolean'],
        ]);
    }
}
