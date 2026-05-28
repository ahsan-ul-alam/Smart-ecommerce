<?php

namespace App\Integrations\Couriers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaperflyCourier extends BaseCourier
{
    public function getProvider(): string
    {
        return 'paperfly';
    }

    public function createConsignment(array $payload): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (! $this->hasCredentials($credentials)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'demo',
                'tracking_id' => 'PF-DEMO-'.Str::upper(Str::random(8)),
                'message' => 'Configure Paperfly merchant_code and api_key in Integrations',
            ];
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$credentials['api_key'],
            'Accept' => 'application/json',
        ])
            ->timeout(30)
            ->post($this->baseUrl().'/order/create', [
                'merchant_order_id' => $payload['order_number'] ?? Str::upper(Str::random(10)),
                'merchant_code' => $credentials['merchant_code'],
                'customer_name' => $payload['recipient_name'] ?? 'Customer',
                'customer_phone' => $payload['recipient_phone'] ?? '01700000000',
                'customer_address' => $payload['address'] ?? 'Dhaka',
                'delivery_area' => $payload['city'] ?? 'Dhaka',
                'collectable_amount' => (float) ($payload['cod_amount'] ?? 0),
                'product_price' => (float) ($payload['cod_amount'] ?? 0),
                'product_weight' => (float) ($payload['weight'] ?? 0.5),
            ]);

        $data = $response->json() ?? [];

        if (! $response->successful()) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['message'] ?? $data['error'] ?? 'Paperfly order creation failed',
                'raw' => $data,
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'created',
            'tracking_id' => $data['tracking_no'] ?? $data['data']['tracking_no'] ?? null,
            'raw' => $data,
        ];
    }

    public function trackShipment(string $trackingId): array
    {
        $apiKey = $this->integration?->credentials['api_key'] ?? null;

        if (! $apiKey) {
            return ['provider' => $this->getProvider(), 'tracking_id' => $trackingId, 'status' => 'unknown'];
        }

        $response = Http::withToken($apiKey)
            ->get($this->baseUrl().'/order/track/'.urlencode($trackingId));

        $data = $response->json() ?? [];

        return [
            'provider' => $this->getProvider(),
            'tracking_id' => $trackingId,
            'status' => $data['status'] ?? $data['delivery_status'] ?? 'unknown',
            'raw' => $data,
        ];
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['merchant_code']) && ! empty($credentials['api_key']);
    }

    protected function baseUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://sandbox.paperfly.com.bd/api/v1'
            : 'https://api.paperfly.com.bd/v1';
    }
}
