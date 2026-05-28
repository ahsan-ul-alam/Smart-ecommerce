<?php

namespace App\Integrations\Couriers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class RedxCourier extends BaseCourier
{
    public function getProvider(): string
    {
        return 'redx';
    }

    public function createConsignment(array $payload): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (empty($credentials['api_token'])) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'demo',
                'tracking_id' => 'REDX-DEMO-'.Str::upper(Str::random(8)),
                'message' => 'Configure REDX API token in Admin → Integrations → Couriers',
            ];
        }

        $response = Http::withToken($credentials['api_token'])
            ->timeout(30)
            ->post($this->baseUrl().'/parcel', [
                'customer_name' => $payload['recipient_name'] ?? 'Customer',
                'customer_phone' => $payload['recipient_phone'] ?? '01700000000',
                'delivery_area' => $payload['city'] ?? 'Dhaka',
                'delivery_area_id' => $payload['area_id'] ?? 1,
                'customer_address' => $payload['address'] ?? '',
                'merchant_invoice_id' => $payload['order_number'] ?? null,
                'cash_collection_amount' => (float) ($payload['cod_amount'] ?? 0),
                'parcel_weight' => (int) ($payload['weight'] ?? 500),
            ]);

        $data = $response->json() ?? [];

        if (! $response->successful()) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['message'] ?? 'REDX parcel creation failed',
                'raw' => $data,
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'created',
            'tracking_id' => $data['tracking_id'] ?? $data['data']['tracking_id'] ?? null,
            'raw' => $data,
        ];
    }

    public function trackShipment(string $trackingId): array
    {
        $token = $this->integration?->credentials['api_token'] ?? null;

        if (! $token) {
            return ['provider' => $this->getProvider(), 'tracking_id' => $trackingId, 'status' => 'unknown'];
        }

        $response = Http::withToken($token)
            ->get($this->baseUrl().'/parcel/'.urlencode($trackingId));

        $data = $response->json() ?? [];

        return [
            'provider' => $this->getProvider(),
            'tracking_id' => $trackingId,
            'status' => $data['delivery_status'] ?? $data['status'] ?? 'unknown',
            'raw' => $data,
        ];
    }

    protected function baseUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://sandbox.redx.com.bd/api/v1'
            : 'https://api.redx.com.bd/v1';
    }
}
