<?php

namespace App\Integrations\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaypalGateway extends BasePaymentGateway
{
    protected ?string $accessToken = null;

    public function getProvider(): string
    {
        return 'paypal';
    }

    public function initiatePayment(array $payload): array
    {
        $credentials = $this->getCredentials();

        if (! $this->hasCredentials($credentials)) {
            return $this->demoResponse($payload);
        }

        $token = $this->grantToken($credentials);
        if (! $token) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => 'PayPal authentication failed',
            ];
        }

        $amount = number_format((float) ($payload['amount'] ?? 0), 2, '.', '');
        $currency = strtoupper($credentials['currency'] ?? 'USD');
        $orderNumber = $payload['order_number'] ?? $payload['invoice_number'] ?? 'ORD-'.time();

        $response = Http::withToken($token)
            ->timeout(30)
            ->post($this->baseUrl().'/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => $orderNumber,
                    'custom_id' => $orderNumber,
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => $amount,
                    ],
                ]],
                'application_context' => [
                    'return_url' => $payload['success_url'] ?? route('shop.payments.paypal.success'),
                    'cancel_url' => $payload['cancel_url'] ?? route('shop.payments.paypal.cancel'),
                    'brand_name' => config('arcommerze.name'),
                    'user_action' => 'PAY_NOW',
                ],
            ]);

        $data = $response->json() ?? [];
        $approveUrl = collect($data['links'] ?? [])->firstWhere('rel', 'approve')['href'] ?? null;

        if (! $response->successful() || empty($approveUrl)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['message'] ?? $data['details'][0]['description'] ?? 'PayPal order creation failed',
                'raw' => $data,
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'initiated',
            'payment_id' => $data['id'],
            'tran_id' => $orderNumber,
            'redirect_url' => $approveUrl,
            'raw' => $data,
        ];
    }

    public function verifyPayment(array $payload): array
    {
        $credentials = $this->getCredentials();
        $paypalOrderId = $payload['payment_id'] ?? $payload['token'] ?? null;

        if (! $paypalOrderId || ! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $token = $this->grantToken($credentials);
        if (! $token) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $response = Http::withToken($token)
            ->timeout(30)
            ->post($this->baseUrl().'/v2/checkout/orders/'.urlencode($paypalOrderId).'/capture');

        $data = $response->json() ?? [];
        $status = $data['status'] ?? '';
        $capture = $data['purchase_units'][0]['payments']['captures'][0] ?? [];
        $verified = $response->successful() && $status === 'COMPLETED';

        return [
            'provider' => $this->getProvider(),
            'verified' => $verified,
            'trx_id' => $capture['id'] ?? $paypalOrderId,
            'raw' => $data,
        ];
    }

    protected function grantToken(array $credentials): ?string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        $response = Http::withBasicAuth($credentials['client_id'], $credentials['client_secret'])
            ->asForm()
            ->timeout(30)
            ->post($this->baseUrl().'/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        $this->accessToken = $response->json('access_token');

        return $this->accessToken;
    }

    protected function demoResponse(array $payload): array
    {
        $orderNumber = $payload['order_number'] ?? 'PAYPAL-DEMO-'.Str::upper(Str::random(6));
        $paymentId = 'PAYPAL-DEMO-'.Str::upper(Str::random(8));

        return [
            'provider' => $this->getProvider(),
            'status' => 'demo',
            'payment_id' => $paymentId,
            'tran_id' => $orderNumber,
            'redirect_url' => route('shop.payments.paypal.demo', ['order' => $orderNumber, 'token' => $paymentId]),
            'message' => 'Configure PayPal client_id and client_secret in Admin → Integrations',
        ];
    }

    protected function getCredentials(): array
    {
        return $this->integration?->credentials ?? [];
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['client_id']) && ! empty($credentials['client_secret']);
    }

    protected function baseUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
    }
}
