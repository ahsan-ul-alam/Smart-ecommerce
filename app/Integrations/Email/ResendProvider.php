<?php

namespace App\Integrations\Email;

use Illuminate\Support\Facades\Http;

class ResendProvider extends BaseEmailProvider
{
    public function getProvider(): string
    {
        return 'resend';
    }

    public function send(array $payload): array
    {
        $c = $this->credentials();

        if (empty($c['api_key'])) {
            return ['success' => true, 'demo' => true, 'message' => 'Email logged (Resend API key not configured)'];
        }

        $response = Http::withToken($c['api_key'])
            ->timeout(30)
            ->post('https://api.resend.com/emails', [
                'from' => $c['from_email'] ?? config('mail.from.address'),
                'to' => [$payload['to']],
                'subject' => $payload['subject'] ?? 'Notification',
                'html' => $payload['html'] ?? $payload['body'] ?? '',
            ]);

        $data = $response->json() ?? [];

        return [
            'success' => $response->successful(),
            'message_id' => $data['id'] ?? null,
            'raw' => $data ?: ['body' => $response->body()],
        ];
    }

    public function testConnection(): bool
    {
        return ! empty($this->credentials()['api_key']);
    }
}
