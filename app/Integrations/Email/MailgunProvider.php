<?php

namespace App\Integrations\Email;

use Illuminate\Support\Facades\Http;

class MailgunProvider extends BaseEmailProvider
{
    public function getProvider(): string
    {
        return 'mailgun';
    }

    public function send(array $payload): array
    {
        $c = $this->credentials();
        $domain = $c['domain'] ?? null;
        $apiKey = $c['api_key'] ?? null;

        if (! $domain || ! $apiKey) {
            return ['success' => true, 'demo' => true, 'message' => 'Email logged (Mailgun not configured)'];
        }

        $response = Http::withBasicAuth('api', $apiKey)
            ->asForm()
            ->timeout(30)
            ->post("https://api.mailgun.net/v3/{$domain}/messages", [
                'from' => $c['from_email'] ?? config('mail.from.address'),
                'to' => $payload['to'],
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
        $c = $this->credentials();

        return ! empty($c['api_key']) && ! empty($c['domain']);
    }
}
