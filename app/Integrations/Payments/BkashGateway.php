<?php

namespace App\Integrations\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class BkashGateway extends BasePaymentGateway
{
    protected ?string $token = null;

    public function getProvider(): string
    {
        return 'bkash';
    }

    public function initiatePayment(array $payload): array
    {
        $credentials = $this->getCredentials();

        if (! $this->hasCredentials($credentials)) {
            return $this->demoResponse($payload, 'Configure bKash credentials in Admin → Settings → Integrations → payment');
        }

        $token = $this->grantToken($credentials);
        if (! $token) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => 'Failed to obtain bKash token. Check app key, secret, username, and password in Integrations.',
            ];
        }

        $amount = number_format((float) ($payload['amount'] ?? 0), 2, '.', '');
        $callbackUrl = $payload['callback_url'] ?? route('shop.payments.bkash.callback');

        $response = Http::withHeaders($this->apiHeaders($credentials, $token))
            ->timeout(30)
            ->post("{$this->baseUrl()}/tokenized/checkout/create", [
                'mode' => '0011',
                'payerReference' => $this->normalizePhone($payload['customer_phone'] ?? '01700000000'),
                'callbackURL' => $callbackUrl,
                'amount' => $amount,
                'currency' => 'BDT',
                'intent' => 'sale',
                'merchantInvoiceNumber' => $this->sanitizeInvoiceNumber(
                    $payload['invoice_number'] ?? $payload['order_number'] ?? 'INV'.time()
                ),
            ]);

        $data = $response->json() ?? [];

        if (! $this->isSuccessResponse($data) || empty($data['bkashURL'])) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['statusMessage']
                    ?? $data['errorMessage']
                    ?? $data['message']
                    ?? 'bKash payment creation failed',
                'raw' => $data ?: ['body' => $response->body()],
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'initiated',
            'payment_id' => $data['paymentID'] ?? null,
            'redirect_url' => $data['bkashURL'],
            'raw' => $data,
        ];
    }

    public function verifyPayment(array $payload): array
    {
        $credentials = $this->getCredentials();
        $paymentId = $payload['payment_id'] ?? $payload['paymentID'] ?? null;

        if (! $paymentId || ! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $token = $this->grantToken($credentials);
        if (! $token) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $response = Http::withHeaders($this->apiHeaders($credentials, $token))
            ->timeout(30)
            ->post("{$this->baseUrl()}/tokenized/checkout/execute", [
                'paymentID' => $paymentId,
            ]);

        $data = $response->json() ?? [];
        $verified = $this->isSuccessResponse($data)
            && in_array($data['transactionStatus'] ?? '', ['Completed', 'completed'], true);

        return [
            'provider' => $this->getProvider(),
            'verified' => $verified,
            'trx_id' => $data['trxID'] ?? null,
            'status' => $data['transactionStatus'] ?? 'unknown',
            'raw' => $data,
        ];
    }

    protected function grantToken(array $credentials): ?string
    {
        if ($this->token) {
            return $this->token;
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ])
            ->timeout(30)
            ->post("{$this->baseUrl()}/tokenized/checkout/token/grant", [
                'app_key' => $credentials['app_key'],
                'app_secret' => $credentials['app_secret'],
            ]);

        $data = $response->json() ?? [];
        $this->token = $data['id_token'] ?? null;

        if (! $this->token) {
            return null;
        }

        if (! $this->isSuccessResponse($data) && isset($data['statusCode'])) {
            $this->token = null;

            return null;
        }

        return $this->token;
    }

    protected function isSuccessResponse(array $data): bool
    {
        $statusCode = (string) ($data['statusCode'] ?? '');

        if ($statusCode !== '' && $statusCode !== '0000') {
            return false;
        }

        return empty($data['errorCode']) && empty($data['errorMessage']);
    }

    protected function getCredentials(): array
    {
        return $this->integration?->credentials ?? [];
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['app_key'])
            && ! empty($credentials['app_secret'])
            && ! empty($credentials['username'])
            && ! empty($credentials['password']);
    }

    protected function baseUrl(): string
    {
        $sandbox = $this->integration?->is_sandbox ?? true;

        return $sandbox
            ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
            : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
    }

    protected function apiHeaders(array $credentials, string $token): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => $token,
            'X-App-Key' => $credentials['app_key'],
        ];
    }

    protected function sanitizeInvoiceNumber(string $invoice): string
    {
        $sanitized = preg_replace('/[<>&]/', '', $invoice) ?: 'INV';

        return Str::limit($sanitized, 255, '');
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?: '01700000000';

        if (str_starts_with($digits, '880')) {
            $digits = '0'.substr($digits, 3);
        }

        if (! str_starts_with($digits, '0') && strlen($digits) === 10) {
            $digits = '0'.$digits;
        }

        return Str::limit($digits, 255, '');
    }

    protected function demoResponse(array $payload, string $message): array
    {
        $paymentId = 'DEMO-'.Str::upper(Str::random(10));

        return [
            'provider' => $this->getProvider(),
            'status' => 'demo',
            'payment_id' => $paymentId,
            'redirect_url' => route('shop.payments.bkash.demo', [
                'paymentID' => $paymentId,
                'invoice' => $payload['invoice_number'] ?? null,
            ]),
            'message' => $message,
        ];
    }
}
