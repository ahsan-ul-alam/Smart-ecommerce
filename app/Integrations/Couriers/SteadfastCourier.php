<?php

namespace App\Integrations\Couriers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SteadfastCourier extends BaseCourier
{
    public function getProvider(): string
    {
        return 'steadfast';
    }

    public function createConsignment(array $payload): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (! $this->hasCredentials($credentials)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'demo',
                'tracking_id' => 'SF-DEMO-'.Str::upper(Str::random(8)),
                'message' => 'Configure Steadfast api_key and secret_key in Integrations',
            ];
        }

        // Sandbox: simulate a consignment without hitting the live API (Steadfast has no
        // public sandbox, and it lets you test the shipment/webhook flow offline).
        if ($this->integration?->is_sandbox) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'created',
                'tracking_id' => 'SF-SANDBOX-'.Str::upper(Str::random(8)),
                'message' => 'Sandbox mode: consignment simulated (no live API call).',
            ];
        }

        try {
            $response = Http::withHeaders($this->headers($credentials))
                ->timeout(30)
                ->post($this->baseUrl().'/create_order', [
                    'invoice' => $payload['order_number'] ?? Str::upper(Str::random(10)),
                    'recipient_name' => $payload['recipient_name'] ?? 'Customer',
                    'recipient_phone' => $this->normalizePhone($payload['recipient_phone'] ?? '01700000000'),
                    'recipient_address' => $payload['address'] ?? 'Dhaka, Bangladesh',
                    'cod_amount' => (float) ($payload['cod_amount'] ?? 0),
                    'note' => 'Order from '.config('arcommerze.name'),
                ]);
        } catch (\Throwable $e) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => 'Could not reach Steadfast API: '.$e->getMessage(),
            ];
        }

        $data = $response->json() ?? [];

        if (! $response->successful()) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['message'] ?? $data['error'] ?? 'Steadfast order creation failed',
                'raw' => $data,
            ];
        }

        $consignment = $data['consignment'] ?? $data['data'] ?? $data;

        return [
            'provider' => $this->getProvider(),
            'status' => 'created',
            'tracking_id' => $consignment['tracking_code'] ?? $consignment['consignment_id'] ?? null,
            'raw' => $data,
        ];
    }

    public function trackShipment(string $trackingId): array
    {
        $credentials = $this->integration?->credentials ?? [];

        if (! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'tracking_id' => $trackingId, 'status' => 'unknown'];
        }

        try {
            $response = Http::withHeaders($this->headers($credentials))
                ->timeout(30)
                ->get($this->baseUrl().'/status_by_trackingcode/'.urlencode($trackingId));
        } catch (\Throwable $e) {
            return [
                'provider' => $this->getProvider(),
                'tracking_id' => $trackingId,
                'status' => 'failed',
                'message' => 'Could not reach Steadfast API: '.$e->getMessage(),
            ];
        }

        $data = $response->json() ?? [];

        return [
            'provider' => $this->getProvider(),
            'tracking_id' => $trackingId,
            'status' => $data['delivery_status'] ?? $data['status'] ?? 'unknown',
            'raw' => $data,
        ];
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['api_key']) && ! empty($credentials['secret_key']);
    }

    protected function headers(array $credentials): array
    {
        return [
            'Api-Key' => $credentials['api_key'],
            'Secret-Key' => $credentials['secret_key'],
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    protected function baseUrl(): string
    {
        return rtrim($this->integration?->config['base_url'] ?? 'https://portal.steadfast.com.bd/api/v1', '/');
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?: '01700000000';

        if (str_starts_with($digits, '880')) {
            $digits = '0'.substr($digits, 3);
        }

        return str_starts_with($digits, '0') ? $digits : '0'.$digits;
    }
}
