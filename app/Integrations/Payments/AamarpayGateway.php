<?php

namespace App\Integrations\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AamarpayGateway extends BasePaymentGateway
{
    public function getProvider(): string
    {
        return 'aamarpay';
    }

    public function initiatePayment(array $payload): array
    {
        $credentials = $this->getCredentials();

        if (! $this->hasCredentials($credentials)) {
            return $this->demoResponse($payload);
        }

        $tranId = $this->sanitizeTranId($payload['order_number'] ?? $payload['invoice_number'] ?? 'AP'.time());

        $params = [
            'store_id' => $credentials['store_id'],
            'signature_key' => $credentials['signature_key'],
            'tran_id' => $tranId,
            'amount' => number_format((float) ($payload['amount'] ?? 0), 2, '.', ''),
            'currency' => 'BDT',
            'desc' => $payload['product_name'] ?? 'Order payment',
            'success_url' => $payload['success_url'] ?? route('shop.payments.aamarpay.success'),
            'fail_url' => $payload['fail_url'] ?? route('shop.payments.aamarpay.fail'),
            'cancel_url' => $payload['cancel_url'] ?? route('shop.payments.aamarpay.cancel'),
            'cus_name' => $payload['customer_name'] ?? 'Customer',
            'cus_email' => $payload['customer_email'] ?? 'customer@arcommerze.test',
            'cus_phone' => $this->normalizePhone($payload['customer_phone'] ?? '01700000000'),
            'cus_add1' => $payload['customer_address'] ?? 'Dhaka',
            'cus_city' => $payload['customer_city'] ?? 'Dhaka',
            'cus_country' => 'Bangladesh',
            'type' => 'json',
        ];

        $response = Http::asJson()->timeout(30)->post($this->initiateUrl(), $params);
        $data = $response->json();

        if (! is_array($data)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => 'Invalid response from aamarPay. Check store ID, signature key, and APP_URL in .env.',
                'raw' => ['body' => $response->body()],
            ];
        }

        $paymentUrl = $data['payment_url'] ?? null;
        $resultOk = filter_var($data['result'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (! $resultOk || empty($paymentUrl)) {
            return [
                'provider' => $this->getProvider(),
                'status' => 'failed',
                'message' => $data['message'] ?? $data['error'] ?? 'aamarPay session creation failed',
                'raw' => $data,
            ];
        }

        return [
            'provider' => $this->getProvider(),
            'status' => 'initiated',
            'payment_id' => $tranId,
            'tran_id' => $tranId,
            'redirect_url' => $paymentUrl,
            'raw' => $data,
        ];
    }

    public function verifyPayment(array $payload): array
    {
        $credentials = $this->getCredentials();
        $tranId = $payload['tran_id'] ?? $payload['mer_txnid'] ?? null;

        if (! $tranId || ! $this->hasCredentials($credentials)) {
            return ['provider' => $this->getProvider(), 'verified' => false];
        }

        $response = Http::timeout(30)->get($this->verifyUrl(), [
            'request_id' => $tranId,
            'store_id' => $credentials['store_id'],
            'signature_key' => $credentials['signature_key'],
            'type' => 'json',
        ]);

        $data = $response->json() ?? [];
        $payStatus = strtolower((string) ($data['pay_status'] ?? ''));
        $statusCode = (string) ($data['status_code'] ?? '');

        $verified = $payStatus === 'successful'
            || $payStatus === 'success'
            || $statusCode === '2';

        return [
            'provider' => $this->getProvider(),
            'verified' => $verified,
            'trx_id' => $data['pg_txnid'] ?? $data['bank_trxid'] ?? $tranId,
            'raw' => $data,
        ];
    }

    protected function demoResponse(array $payload): array
    {
        $orderNumber = $payload['order_number'] ?? 'AP-DEMO-'.Str::upper(Str::random(6));

        return [
            'provider' => $this->getProvider(),
            'status' => 'demo',
            'payment_id' => $orderNumber,
            'tran_id' => $orderNumber,
            'redirect_url' => route('shop.payments.aamarpay.demo', ['tran_id' => $orderNumber]),
            'message' => 'Configure aamarPay store_id and signature_key in Admin → Integrations',
        ];
    }

    protected function getCredentials(): array
    {
        return $this->integration?->credentials ?? [];
    }

    protected function hasCredentials(array $c): bool
    {
        return ! empty($c['store_id']) && ! empty($c['signature_key']);
    }

    protected function initiateUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://sandbox.aamarpay.com/jsonpost.php'
            : 'https://secure.aamarpay.com/jsonpost.php';
    }

    protected function verifyUrl(): string
    {
        return ($this->integration?->is_sandbox ?? true)
            ? 'https://sandbox.aamarpay.com/api/v1/trxcheck/request.php'
            : 'https://secure.aamarpay.com/api/v1/trxcheck/request.php';
    }

    protected function sanitizeTranId(string $id): string
    {
        return Str::limit(preg_replace('/[^A-Za-z0-9\-_]/', '', $id) ?: 'AP', 32, '');
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?: '01700000000';

        if (str_starts_with($digits, '880')) {
            return $digits;
        }

        if (str_starts_with($digits, '0')) {
            return '88'.$digits;
        }

        return '880'.$digits;
    }
}
