<?php

namespace App\Services\Geo;

use Illuminate\Support\Facades\Cache;

class BangladeshLocationService
{
    private const CACHE_KEY = 'bangladesh.location.tree';

    public function divisions(): array
    {
        return collect($this->tree())
            ->map(fn ($div) => ['value' => $div['name'], 'label' => $div['name']])
            ->values()
            ->all();
    }

    public function districts(?string $division): array
    {
        if (! $division) {
            return [];
        }

        $div = collect($this->tree())->firstWhere('name', $division);

        return collect($div['districts'] ?? [])
            ->map(fn ($d) => ['value' => $d['name'], 'label' => $d['name']])
            ->values()
            ->all();
    }

    public function thanas(?string $division, ?string $district): array
    {
        if (! $division || ! $district) {
            return [];
        }

        $div = collect($this->tree())->firstWhere('name', $division);
        $dist = collect($div['districts'] ?? [])->firstWhere('name', $district);

        return collect($dist['thanas'] ?? [])
            ->map(fn ($t) => ['value' => $t, 'label' => $t])
            ->values()
            ->all();
    }

    public function validate(string $division, string $district, string $thana): bool
    {
        return collect($this->thanas($division, $district))->pluck('value')->contains($thana);
    }

    public function findDivisionForDistrict(string $district): ?string
    {
        foreach ($this->tree() as $division) {
            if (collect($division['districts'] ?? [])->contains('name', $district)) {
                return $division['name'];
            }
        }

        return null;
    }

    public function normalizeDistrictForShipping(string $district): string
    {
        $aliases = [
            'chittagong' => 'Chattogram',
            'chattagram' => 'Chattogram',
            'cumilla' => 'Comilla',
            'bogra' => 'Bogura',
            'barisal' => 'Barishal',
            'jessore' => 'Jashore',
            'jessor' => 'Jashore',
        ];

        $key = strtolower(trim($district));

        return $aliases[$key] ?? $district;
    }

    public function formatAddress(array $address): string
    {
        if (! empty($address['division'])) {
            $parts = array_filter([
                $address['local_address'] ?? null,
                $address['thana'] ?? $address['city'] ?? null,
                $address['district'] ?? null,
                $address['division'] ?? null,
            ]);

            return implode(', ', $parts);
        }

        $parts = array_filter([
            $address['address_line_1'] ?? null,
            $address['address_line_2'] ?? null,
            $address['city'] ?? null,
            $address['district'] ?? null,
        ]);

        return implode(', ', $parts);
    }

    public function toShippingPayload(array $input): array
    {
        $district = $this->normalizeDistrictForShipping($input['district']);

        return [
            'name' => $input['name'],
            'phone' => $input['phone'],
            'email' => $input['email'] ?? null,
            'division' => $input['division'],
            'district' => $district,
            'thana' => $input['thana'],
            'local_address' => $input['local_address'],
            'address_line_1' => $input['local_address'],
            'address_line_2' => null,
            'city' => $input['thana'],
            'postal_code' => $input['postal_code'] ?? null,
            'country' => 'Bangladesh',
        ];
    }

    protected function tree(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return $this->buildTree();
        });
    }

    protected function buildTree(): array
    {
        $base = database_path('data');

        $divisions = json_decode(file_get_contents($base.'/divisions.json'), true) ?: [];
        $districts = json_decode(file_get_contents($base.'/districts.json'), true) ?: [];
        $upazilas = json_decode(file_get_contents($base.'/upazilas.json'), true) ?: [];

        $districtsByDivision = collect($districts)->groupBy('division_id');
        $upazilasByDistrict = collect($upazilas)->groupBy('district_id');

        return collect($divisions)->map(function ($division) use ($districtsByDivision, $upazilasByDistrict) {
            $divisionDistricts = $districtsByDivision->get($division['id'], collect());

            return [
                'id' => $division['id'],
                'name' => $division['name'],
                'bn_name' => $division['bn_name'] ?? null,
                'districts' => $divisionDistricts->map(function ($district) use ($upazilasByDistrict) {
                    $thanas = $upazilasByDistrict->get($district['id'], collect())
                        ->pluck('name')
                        ->sort()
                        ->values()
                        ->all();

                    return [
                        'id' => $district['id'],
                        'name' => $district['name'],
                        'bn_name' => $district['bn_name'] ?? null,
                        'thanas' => $thanas,
                    ];
                })->sortBy('name')->values()->all(),
            ];
        })->sortBy('name')->values()->all();
    }
}
