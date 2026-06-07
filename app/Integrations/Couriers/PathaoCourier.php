<?php

namespace App\Integrations\Couriers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PathaoCourier extends BaseCourier
{
    protected ?string $token = null;

    public function getProvider(): string
    {
        return 'pathao';
    }

    public function createConsignment(array $payload): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (! $this->hasCredentials($credentials)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'demo',
                'tracking_id' => 'PATHAO-DEMO-'.Str::upper(Str::random(8)),
                'message' => 'Configure Pathao client_id, client_secret, username, and password in Integrations',
            ];
        }

        $token = $this->grantToken($credentials);
        if (! $token) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => 'Pathao authentication failed',
            ];
        }

        $response = Http::withToken($token)
            ->timeout(30)
            ->post($this->baseUrl().'/aladdin/api/v1/orders', [
                'store_id' => (int) ($credentials['store_id'] ?? 1),
                'merchant_order_id' => $payload['order_number'] ?? Str::upper(Str::random(10)),
                'recipient_name' => $payload['recipient_name'] ?? 'Customer',
                'recipient_phone' => $this->normalizePhone($payload['recipient_phone'] ?? '01700000000'),
                'recipient_address' => $payload['address'] ?? 'Dhaka',
                'recipient_city' => $this->cityId($payload['city'] ?? 'Dhaka'),
                'recipient_zone' => (int) ($credentials['zone_id'] ?? 1),
                'recipient_area' => (int) ($credentials['area_id'] ?? 1),
                'delivery_type' => 48,
                'item_type' => 2,
                'item_quantity' => 1,
                'item_weight' => (float) ($payload['weight'] ?? 0.5),
                'amount_to_collect' => (int) round((float) ($payload['cod_amount'] ?? 0)),
            ]);

        $data = $response->json() ?? [];

        if (! $response->successful()) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['message'] ?? $data['error'] ?? 'Pathao order creation failed',
                'raw' => $data,
            ];
        }

        $orderData = $data['data'] ?? $data;

        return [
            'provider' => $this->getProvider(),
            'status' => 'created',
            'tracking_id' => $orderData['consignment_id'] ?? $orderData['order_id'] ?? null,
            'raw' => $data,
        ];
    }

    public function trackShipment(string $trackingId): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (str_starts_with($trackingId, 'PATHAO-DEMO-')) {
            return [
                'provider' => $this->getProvider(),
                'tracking_id' => $trackingId,
                'status' => 'demo',
                'message' => 'Demo shipment — configure Pathao credentials in Admin → Settings → Couriers for live tracking.',
            ];
        }

        if (! $this->hasCredentials($credentials)) {
            return [
                'provider' => $this->getProvider(),
                'tracking_id' => $trackingId,
                'status' => 'unknown',
                'message' => 'Configure Pathao client_id, client_secret, username, and password in Admin → Settings → Couriers.',
            ];
        }

        $token = $this->grantToken($credentials);

        if (! $token) {
            return [
                'provider' => $this->getProvider(),
                'tracking_id' => $trackingId,
                'status' => 'unknown',
                'message' => 'Pathao authentication failed. Check your courier credentials.',
            ];
        }

        $response = Http::withToken($token)
            ->get($this->baseUrl().'/aladdin/api/v1/orders/'.urlencode($trackingId).'/info');

        $data = $response->json() ?? [];

        return [
            'provider' => $this->getProvider(),
            'tracking_id' => $trackingId,
            'status' => $data['data']['order_status'] ?? $data['order_status'] ?? 'unknown',
            'raw' => $data,
        ];
    }

    protected function grantToken(array $credentials): ?string
    {
        if (! $this->hasCredentials($credentials)) {
            return null;
        }

        $cacheKey = 'pathao_token_'.md5($credentials['client_id']);

        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        $response = Http::timeout(30)->post($this->baseUrl().'/aladdin/api/v1/issue-token', [
            'client_id' => $credentials['client_id'],
            'client_secret' => $credentials['client_secret'],
            'grant_type' => 'password',
            'username' => $credentials['username'] ?? '',
            'password' => $credentials['password'] ?? '',
        ]);

        $token = $response->json('access_token');
        if ($token) {
            Cache::put($cacheKey, $token, 3500);
        }

        return $token;
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['client_id'])
            && ! empty($credentials['client_secret'])
            && ! empty($credentials['username'])
            && ! empty($credentials['password']);
    }

    protected function baseUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://courier-api.pathao.com'
            : 'https://api-hermes.pathao.com';
    }

    protected function cityId(string $city): int
    {
        return match (strtolower($city)) {
            'chittagong', 'ctg' => 2,
            'sylhet' => 3,
            default => 1,
        };
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?: '01700000000';

        if (str_starts_with($digits, '880')) {
            return '0'.substr($digits, 3);
        }

        return str_starts_with($digits, '0') ? $digits : '0'.$digits;
    }
}
