<?php

namespace App\Services\Commerce;

use App\Models\ShippingZone;
use App\Services\Geo\BangladeshLocationService;
use App\Services\Settings\SettingService;

class ShippingZoneService
{
    public function __construct(
        protected SettingService $settings,
        protected BangladeshLocationService $locations,
    ) {}

    public function calculate(float $subtotal, ?string $district = null, bool $hasItems = true): array
    {
        if (! $hasItems) {
            return ['shipping' => 0.0, 'zone' => null, 'free_shipping_min' => null];
        }

        $zone = $this->matchZone($district ? $this->locations->normalizeDistrictForShipping($district) : null);

        $charge = (float) ($zone?->shipping_charge
            ?? $this->settings->get('commerce', 'shipping_charge', 80));

        $freeMin = $zone?->free_shipping_min;
        if ($freeMin === null) {
            $freeMin = (float) $this->settings->get('commerce', 'free_shipping_min', 2000);
        } else {
            $freeMin = (float) $freeMin;
        }

        $shipping = $subtotal >= $freeMin ? 0.0 : $charge;

        return [
            'shipping' => round($shipping, 2),
            'zone' => $zone?->only(['id', 'name']),
            'free_shipping_min' => $freeMin,
        ];
    }

    public function matchZone(?string $district): ?ShippingZone
    {
        if (! $district) {
            return null;
        }

        $needle = strtolower(trim($district));

        return ShippingZone::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->first(function (ShippingZone $zone) use ($needle) {
                foreach ($zone->districts ?? [] as $d) {
                    if (strtolower(trim((string) $d)) === $needle) {
                        return true;
                    }
                }

                return false;
            });
    }
}
