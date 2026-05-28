<?php

namespace App\Integrations\Sms;

use Illuminate\Support\Facades\Http;

class BulkSmsBdProvider extends BaseSmsProvider
{
    public function getProvider(): string
    {
        return 'bulksmsbd';
    }

    public function send(string $to, string $message, array $options = []): array
    {
        $c = $this->credentials();
        if (empty($c['api_key'])) {
            return ['success' => true, 'demo' => true, 'message' => 'SMS logged (BulkSMSBD not configured)'];
        }

        $response = Http::get('http://bulksmsbd.net/api/smsapi', [
            'api_key' => $c['api_key'],
            'type' => 'text',
            'number' => $to,
            'message' => $message,
        ]);

        return ['success' => $response->successful(), 'raw' => $response->body()];
    }

    public function testConnection(): bool
    {
        return ! empty($this->credentials()['api_key']);
    }
}
