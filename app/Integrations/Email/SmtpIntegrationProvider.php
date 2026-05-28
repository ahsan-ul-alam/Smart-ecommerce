<?php

namespace App\Integrations\Email;

use Illuminate\Support\Facades\Mail;

class SmtpIntegrationProvider extends BaseEmailProvider
{
    public function getProvider(): string
    {
        return 'smtp';
    }

    public function send(array $payload): array
    {
        $c = $this->credentials();

        if (empty($c['host'])) {
            return ['success' => true, 'demo' => true, 'message' => 'Email logged (SMTP host not configured in integration)'];
        }

        config([
            'mail.default' => 'integration_smtp',
            'mail.mailers.integration_smtp' => [
                'transport' => 'smtp',
                'host' => $c['host'],
                'port' => (int) ($c['port'] ?? 587),
                'encryption' => $c['encryption'] ?? 'tls',
                'username' => $c['username'] ?? null,
                'password' => $c['password'] ?? null,
                'timeout' => null,
            ],
            'mail.from.address' => $c['from_email'] ?? config('mail.from.address'),
            'mail.from.name' => $c['from_name'] ?? config('mail.from.name'),
        ]);

        try {
            Mail::mailer('integration_smtp')->html(
                $payload['html'] ?? $payload['body'] ?? '',
                fn ($message) => $message->to($payload['to'])->subject($payload['subject'] ?? 'Notification')
            );

            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function testConnection(): bool
    {
        return ! empty($this->credentials()['host']);
    }
}
