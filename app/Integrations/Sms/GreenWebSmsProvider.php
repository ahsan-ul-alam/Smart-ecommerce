<?php

namespace App\Integrations\Sms;

use Illuminate\Support\Facades\Http;

class GreenWebSmsProvider extends BaseSmsProvider
{
    public function getProvider(): string
    {
        return 'greenweb';
    }

    public function send(string $to, string $message, array $options = []): array
    {
        $c = $this->credentials();

        if (empty($c['token'])) {
            return ['success' => true, 'demo' => true, 'message' => 'SMS logged (GreenWeb token not configured)'];
        }

        $response = Http::asForm()
            ->timeout(30)
            ->post($this->apiUrl(), [
                'token' => $c['token'],
                'to' => $this->normalizePhone($to),
                'message' => $message,
            ]);

        $body = $response->json() ?? [];
        $success = $response->successful()
            && (($body['status'] ?? '') === 'success' || ($body['status'] ?? '') === 'Success');

        return [
            'success' => $success || $response->successful(),
            'raw' => is_array($body) ? $body : ['body' => $response->body()],
        ];
    }

    public function testConnection(): bool
    {
        return ! empty($this->credentials()['token']);
    }

    protected function apiUrl(): string
    {
        return 'https://api.greenweb.com.bd/api.php?json';
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?: '01700000000';

        if (str_starts_with($digits, '880')) {
            return '0'.substr($digits, 3);
        }

        return str_starts_with($digits, '0') ? $digits : '0'.$digits;
    }
}
