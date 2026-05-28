<?php

namespace App\Integrations\Couriers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class EcourierCourier extends BaseCourier
{
    public function getProvider(): string
    {
        return 'ecourier';
    }

    public function createConsignment(array $payload): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (! $this->hasCredentials($credentials)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'demo',
                'tracking_id' => 'ECO-DEMO-'.Str::upper(Str::random(8)),
                'message' => 'Configure eCourier user_id and api_key in Integrations',
            ];
        }

        $response = Http::withHeaders([
            'API-SECRET' => $credentials['api_key'],
            'API-KEY' => $credentials['user_id'],
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])
            ->timeout(30)
            ->post($this->baseUrl().'/place-order', [
                'product_id' => $payload['order_number'] ?? Str::upper(Str::random(10)),
                'parcel_reference' => $payload['order_number'] ?? null,
                'recipient_name' => $payload['recipient_name'] ?? 'Customer',
                'recipient_phone' => $payload['recipient_phone'] ?? '01700000000',
                'recipient_address' => $payload['address'] ?? 'Dhaka',
                'recipient_city' => $payload['city'] ?? 'Dhaka',
                'cod_amount' => (float) ($payload['cod_amount'] ?? 0),
                'parcel_weight' => (float) ($payload['weight'] ?? 0.5),
            ]);

        $data = $response->json() ?? [];

        if (! $response->successful()) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['message'] ?? $data['error'] ?? 'eCourier order creation failed',
                'raw' => $data,
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'created',
            'tracking_id' => $data['ID'] ?? $data['tracking_id'] ?? $data['data']['ID'] ?? null,
            'raw' => $data,
        ];
    }

    public function trackShipment(string $trackingId): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'tracking_id' => $trackingId, 'status' => 'unknown'];
        }

        $response = Http::withHeaders([
            'API-SECRET' => $credentials['api_key'],
            'API-KEY' => $credentials['user_id'],
        ])->get($this->baseUrl().'/track-order/'.urlencode($trackingId));

        $data = $response->json() ?? [];

        return [
            'provider' => $this->getProvider(),
            'tracking_id' => $trackingId,
            'status' => $data['status'] ?? 'unknown',
            'raw' => $data,
        ];
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['user_id']) && ! empty($credentials['api_key']);
    }

    protected function baseUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://staging.ecourier.com.bd/api'
            : 'https://backoffice.ecourier.com.bd/api';
    }
}
