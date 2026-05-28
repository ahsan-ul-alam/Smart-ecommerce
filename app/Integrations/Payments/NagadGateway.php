<?php

namespace App\Integrations\Payments;

use App\Support\NagadCrypto;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class NagadGateway extends BasePaymentGateway
{
    public function getProvider(): string
    {
        return 'nagad';
    }

    public function initiatePayment(array $payload): array
    {
        $credentials = $this->getCredentials();

        if (! $this->hasCredentials($credentials)) {
            return $this->demoResponse($payload);
        }

        $merchantId = $credentials['merchant_id'];
        $orderId = $this->sanitizeOrderId($payload['order_number'] ?? $payload['invoice_number'] ?? 'N'.time());
        $datetime = now()->format('YmdHis');
        $challenge = Str::random(40);

        $sensitive = json_encode([
            'merchantId' => $merchantId,
            'orderId' => $orderId,
            'datetime' => $datetime,
            'challenge' => $challenge,
        ]);

        $postData = [
            'accountNumber' => $credentials['merchant_number'],
            'dateTime' => $datetime,
            'sensitiveData' => NagadCrypto::encrypt($sensitive, $credentials['public_key']),
            'signature' => NagadCrypto::sign($sensitive, $credentials['private_key']),
        ];

        $response = Http::withHeaders($this->headers())
            ->timeout(30)
            ->post("{$this->baseUrl()}/check-out/initialize/{$merchantId}/{$orderId}", $postData);

        $body = $response->json() ?? [];

        if (! $response->successful() || ($body['reason'] ?? '') !== 'Ready to accept payment') {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $body['message'] ?? 'Nagad initialize failed',
                'raw' => $body,
            ];
        }

        $decrypted = json_decode(
            NagadCrypto::decrypt($body['sensitiveData'], $credentials['private_key']),
            true
        );

        $paymentRef = $decrypted['paymentReferenceId'] ?? null;
        $redirectUrl = $paymentRef
            ? "{$this->baseUrl()}/check-out/complete/{$paymentRef}"
            : null;

        return [
            'provider' => $this->getProvider(),
            'status' => 'initiated',
            'payment_id' => $paymentRef,
            'order_id' => $orderId,
            'redirect_url' => $redirectUrl,
            'raw' => $body,
        ];
    }

    public function verifyPayment(array $payload): array
    {
        $credentials = $this->getCredentials();
        $paymentRef = $payload['payment_id'] ?? $payload['payment_ref_id'] ?? null;

        if (! $paymentRef || ! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $response = Http::withHeaders($this->headers())
            ->timeout(30)
            ->get("{$this->baseUrl()}/verify/payment/{$paymentRef}");

        $body = $response->json() ?? [];

        if (! $response->successful() || empty($body['sensitiveData'])) {
            return ['provider' => $this->getProvider(), 'verified' => false, 'raw' => $body];
        }

        $decrypted = json_decode(
            NagadCrypto::decrypt($body['sensitiveData'], $credentials['private_key']),
            true
        );

        $status = $decrypted['status'] ?? '';
        $verified = strtoupper($status) === 'SUCCESS';

        return [
            'provider' => $this->getProvider(),
            'verified' => $verified,
            'trx_id' => $decrypted['issuerPaymentRefNo'] ?? $paymentRef,
            'status' => $status,
            'raw' => $decrypted,
        ];
    }

    protected function demoResponse(array $payload): array
    {
        $orderId = 'NAGAD-DEMO-'.Str::upper(Str::random(8));

        return [
            'provider' => $this->getProvider(),
            'status' => 'demo',
            'payment_id' => $orderId,
            'order_id' => $orderId,
            'redirect_url' => route('shop.payments.nagad.demo', ['order_id' => $orderId]),
            'message' => 'Configure Nagad merchant_id, keys in Admin → Integrations',
        ];
    }

    protected function getCredentials(): array
    {
        return $this->integration?->credentials ?? [];
    }

    protected function hasCredentials(array $c): bool
    {
        return ! empty($c['merchant_id'])
            && ! empty($c['merchant_number'])
            && ! empty($c['public_key'])
            && ! empty($c['private_key']);
    }

    protected function baseUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://api.mynagad.com:20002/api/dfs'
            : 'https://api.mynagad.com/api/dfs';
    }

    protected function headers(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'X-KM-Api-Version' => 'v-0.2.0',
            'X-KM-Client-Type' => 'PC_WEB',
            'X-KM-IP-Version' => 'IP_V4',
        ];
    }

    protected function sanitizeOrderId(string $id): string
    {
        return Str::limit(preg_replace('/[^A-Za-z0-9\-_]/', '', $id) ?: 'N', 20, '');
    }
}
