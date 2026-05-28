<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\Customer\LoyaltyService;
use App\Services\Customer\WalletService;
use Illuminate\Database\Seeder;

class LoyaltyWalletSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::query()->where('email', 'customer@arcommerze.test')->first();

        if (! $customer) {
            return;
        }

        app(LoyaltyService::class)->adjust($customer, 500, 'Welcome bonus points');
        app(WalletService::class)->credit($customer, 200, 'Welcome wallet credit');
    }
}
