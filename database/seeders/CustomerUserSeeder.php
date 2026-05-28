<?php

namespace Database\Seeders;

use App\Domain\Enums\UserStatus;
use App\Models\User;
use App\Services\Marketing\ReferralService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerUserSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::query()->updateOrCreate(
            ['email' => 'customer@arcommerze.test'],
            [
                'name' => 'Demo Customer',
                'phone' => '01700000000',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => UserStatus::Active,
            ]
        );

        if (! $customer->hasRole('customer')) {
            $customer->assignRole('customer');
        }

        app(ReferralService::class)->ensureCode($customer);
    }
}
