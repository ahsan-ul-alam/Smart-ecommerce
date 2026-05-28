<?php

namespace App\Integrations\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SslcommerzGateway extends BasePaymentGateway
{
    public function getProvider(): string
    {
        return 'sslcommerz';
    }

    public function initiatePayment(array $payload): array
    {
        $credentials = $this->getCredentials();

        if (! $this->hasCredentials($credentials)) {
            return $this->demoResponse($payload);
        }

        $tranId = $this->sanitizeTranId($payload['invoice_number'] ?? $payload['order_number'] ?? 'TXN-'.time());
        $amount = number_format((float) ($payload['amount'] ?? 0), 2, '.', '');

        $params = [
            'store_id' => $credentials['store_id'],
            'store_passwd' => $credentials['store_password'],
            'total_amount' => $amount,
            'currency' => 'BDT',
            'tran_id' => $tranId,
            'success_url' => $payload['success_url'] ?? route('shop.payments.sslcommerz.callback', ['status' => 'success']),
            'fail_url' => $payload['fail_url'] ?? route('shop.payments.sslcommerz.callback', ['status' => 'fail']),
            'cancel_url' => $payload['cancel_url'] ?? route('shop.payments.sslcommerz.callback', ['status' => 'cancel']),
            'emi_option' => 0,
            'cus_name' => $payload['customer_name'] ?? 'Customer',
            'cus_email' => $payload['customer_email'] ?? 'customer@arcommerze.test',
            'cus_add1' => $payload['customer_address'] ?? 'Dhaka, Bangladesh',
            'cus_city' => $payload['customer_city'] ?? 'Dhaka',
            'cus_country' => 'Bangladesh',
            'cus_phone' => $payload['customer_phone'] ?? '01700000000',
            'shipping_method' => 'NO',
            'product_name' => $payload['product_name'] ?? 'ArCommerze Order',
            'product_category' => 'Ecommerce',
            'product_profile' => 'general',
        ];

        if (! empty($payload['ipn_url'])) {
            $params['ipn_url'] = $payload['ipn_url'];
        }

        $response = Http::asForm()
            ->timeout(30)
            ->post($this->sessionApiUrl(), $params);

        $data = $response->json();

        if (! is_array($data)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => 'Invalid response from SSLCommerz. Check store ID, password, and APP_URL in .env.',
                'raw' => ['body' => $response->body()],
            ];
        }

        $gatewayUrl = $data['GatewayPageURL'] ?? $data['gatewayPageURL'] ?? null;
        $status = strtoupper((string) ($data['status'] ?? ''));

        if ($status !== 'SUCCESS' || empty($gatewayUrl)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['failedreason'] ?? $data['error'] ?? 'SSLCommerz session creation failed',
                'raw' => $data,
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'initiated',
            'payment_id' => $data['sessionkey'] ?? $tranId,
            'tran_id' => $tranId,
            'redirect_url' => $gatewayUrl,
            'raw' => $data,
        ];
    }

    public function verifyPayment(array $payload): array
    {
        $credentials = $this->getCredentials();
        $valId = $payload['val_id'] ?? null;

        if (! $valId || ! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $response = Http::get($this->validationApiUrl(), [
            'val_id' => $valId,
            'store_id' => $credentials['store_id'],
            'store_passwd' => $credentials['store_password'],
            'format' => 'json',
        ]);

        $data = $response->json() ?? [];
        $status = strtoupper($data['status'] ?? '');
        $verified = $response->successful()
            && in_array($status, ['VALID', 'VALIDATED'], true);

        $expectedTranId = $payload['tran_id'] ?? null;
        if ($verified && $expectedTranId && ($data['tran_id'] ?? '') !== $expectedTranId) {
            $verified = false;
        }

        $expectedAmount = isset($payload['amount']) ? number_format((float) $payload['amount'], 2, '.', '') : null;
        if ($verified && $expectedAmount !== null && ($data['amount'] ?? '') != $expectedAmount) {
            $verified = false;
        }

        return [
            'provider' => $this->getProvider(),
            'verified' => $verified,
            'trx_id' => $data['bank_tran_id'] ?? $data['card_ref_id'] ?? null,
            'status' => $status,
            'tran_id' => $data['tran_id'] ?? null,
            'raw' => $data,
        ];
    }

    protected function demoResponse(array $payload): array
    {
        $orderNumber = $payload['order_number'] ?? $payload['invoice_number'] ?? 'SSL-DEMO-'.Str::upper(Str::random(8));

        return [
            'provider' => $this->getProvider(),
            'status' => 'demo',
            'payment_id' => $orderNumber,
            'tran_id' => $orderNumber,
            'redirect_url' => route('shop.payments.sslcommerz.demo', ['tran_id' => $orderNumber]),
            'message' => 'Configure SSLCommerz store_id and store_password in Admin → Integrations',
        ];
    }

    protected function getCredentials(): array
    {
        return $this->integration?->credentials ?? [];
    }

    protected function hasCredentials(array $credentials): bool
    {
        return ! empty($credentials['store_id']) && ! empty($credentials['store_password']);
    }

    protected function sessionApiUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
    }

    protected function validationApiUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
            : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';
    }

    protected function sanitizeTranId(string $tranId): string
    {
        $sanitized = preg_replace('/[^A-Za-z0-9\-_]/', '', $tranId) ?: 'TXN';

        return Str::limit($sanitized, 30, '');
    }
}
