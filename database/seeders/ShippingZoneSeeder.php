<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Dhaka Metro',
                'districts' => ['Dhaka', 'Gazipur', 'Narayanganj'],
                'shipping_charge' => 60,
                'free_shipping_min' => 1500,
                'sort_order' => 0,
            ],
            [
                'name' => 'Chittagong Division',
                'districts' => ['Chittagong', 'Cox\'s Bazar', 'Comilla'],
                'shipping_charge' => 100,
                'free_shipping_min' => 2500,
                'sort_order' => 1,
            ],
            [
                'name' => 'Rest of Bangladesh',
                'districts' => ['Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Bogra', 'Jessore'],
                'shipping_charge' => 120,
                'free_shipping_min' => 3000,
                'sort_order' => 2,
            ],
        ];

        foreach ($zones as $zone) {
            ShippingZone::query()->updateOrCreate(
                ['name' => $zone['name']],
                array_merge($zone, ['is_active' => true])
            );
        }
    }
}
