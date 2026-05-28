<?php

namespace App\Integrations\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class StripeGateway extends BasePaymentGateway
{
    public function getProvider(): string
    {
        return 'stripe';
    }

    public function initiatePayment(array $payload): array
    {
        $credentials = $this->getCredentials();

        if (! $this->hasCredentials($credentials)) {
            return $this->demoResponse($payload);
        }

        $amount = (int) round((float) ($payload['amount'] ?? 0) * 100);
        $currency = strtolower($credentials['currency'] ?? 'bdt');
        $orderNumber = $payload['order_number'] ?? $payload['invoice_number'] ?? 'ORD-'.time();

        $response = Http::withToken($credentials['secret_key'])
            ->asForm()
            ->timeout(30)
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'success_url' => ($payload['success_url'] ?? route('shop.payments.stripe.success')).'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $payload['cancel_url'] ?? route('shop.payments.stripe.cancel'),
                'client_reference_id' => $orderNumber,
                'metadata[order_number]' => $orderNumber,
                'line_items[0][quantity]' => 1,
                'line_items[0][price_data][currency]' => $currency,
                'line_items[0][price_data][unit_amount]' => max($amount, 50),
                'line_items[0][price_data][product_data][name]' => $payload['product_name'] ?? 'Order '.$orderNumber,
            ]);

        $data = $response->json() ?? [];

        if (! $response->successful() || empty($data['url'])) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['error']['message'] ?? 'Stripe session creation failed',
                'raw' => $data,
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'initiated',
            'payment_id' => $data['id'],
            'tran_id' => $orderNumber,
            'redirect_url' => $data['url'],
            'raw' => $data,
        ];
    }

    public function verifyPayment(array $payload): array
    {
        $credentials = $this->getCredentials();
        $sessionId = $payload['session_id'] ?? $payload['payment_id'] ?? null;

        if (! $sessionId || ! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $response = Http::withToken($credentials['secret_key'])
            ->get('https://api.stripe.com/v1/checkout/sessions/'.urlencode($sessionId));

        $data = $response->json() ?? [];
        $verified = ($data['payment_status'] ?? '') === 'paid';

        return [
            'provider' => $this->getProvider(),
            'verified' => $verified,
            'trx_id' => $data['payment_intent'] ?? $sessionId,
            'raw' => $data,
        ];
    }

    protected function demoResponse(array $payload): array
    {
        $orderNumber = $payload['order_number'] ?? 'STRIPE-DEMO-'.Str::upper(Str::random(6));

        return [
            'provider' => $this->getProvider(),
            'status' => 'demo',
            'payment_id' => 'cs_demo_'.Str::lower(Str::random(12)),
            'tran_id' => $orderNumber,
            'redirect_url' => route('shop.payments.stripe.demo', ['order' => $orderNumber]),
            'message' => 'Configure Stripe secret_key in Admin → Integrations',
        ];
    }

    protected function getCredentials(): array
    {
        return $this->integration?->credentials ?? [];
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['secret_key']);
    }
}
