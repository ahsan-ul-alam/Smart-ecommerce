<?php

namespace Database\Seeders;

use App\Domain\Enums\CouponType;
use App\Domain\Enums\IntegrationType;
use App\Models\Coupon;
use App\Models\Integration;
use Illuminate\Database\Seeder;

class CommerceSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::query()->updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => CouponType::Percent,
                'value' => 10,
                'min_order_amount' => 500,
                'max_uses' => 1000,
                'is_active' => true,
                'expires_at' => now()->addYear(),
            ]
        );

        Coupon::query()->updateOrCreate(
            ['code' => 'FLAT100'],
            [
                'type' => CouponType::Fixed,
                'value' => 100,
                'min_order_amount' => 1000,
                'is_active' => true,
            ]
        );

        Integration::query()
            ->where('type', IntegrationType::Payment)
            ->where('provider', 'bkash')
            ->update(['is_enabled' => true, 'is_sandbox' => true]);

        Integration::query()
            ->where('type', IntegrationType::Payment)
            ->whereIn('provider', ['stripe', 'paypal'])
            ->update(['is_enabled' => true, 'is_sandbox' => true]);

        Integration::query()
            ->where('type', IntegrationType::Payment)
            ->where('provider', 'sslcommerz')
            ->update(['is_enabled' => true, 'is_sandbox' => true]);

        Integration::query()
            ->where('type', IntegrationType::Payment)
            ->where('provider', 'nagad')
            ->update(['is_enabled' => true, 'is_sandbox' => true]);

        $aamarpay = Integration::query()
            ->where('type', IntegrationType::Payment)
            ->where('provider', 'aamarpay')
            ->first();

        if ($aamarpay) {
            $aamarpay->update([
                'is_enabled' => true,
                'is_sandbox' => true,
                'credentials' => [
                    'store_id' => 'aamarpaytest',
                    'signature_key' => 'dbb74894e82415a2f7ff0ec3a97e4183',
                ],
            ]);
        }

        Integration::query()
            ->where('type', IntegrationType::Sms)
            ->where('provider', 'bulksmsbd')
            ->update(['is_enabled' => true, 'is_sandbox' => true]);

        Integration::query()
            ->where('type', IntegrationType::Sms)
            ->where('provider', 'greenweb')
            ->update(['is_enabled' => false, 'is_sandbox' => true]);

        Integration::query()
            ->where('type', IntegrationType::Email)
            ->where('provider', 'resend')
            ->update(['is_enabled' => false, 'is_sandbox' => true]);
    }
}
