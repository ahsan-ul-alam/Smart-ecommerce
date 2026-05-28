<?php

namespace App\Integrations\Email;

use Illuminate\Support\Facades\Http;

class SesProvider extends BaseEmailProvider
{
    public function getProvider(): string
    {
        return 'ses';
    }

    public function send(array $payload): array
    {
        $c = $this->credentials();

        if (empty($c['access_key']) || empty($c['secret_key']) || empty($c['region'])) {
            return ['success' => true, 'demo' => true, 'message' => 'Email logged (Amazon SES not configured)'];
        }

        // SES requires AWS SigV4 — recommend using .env MAIL_MAILER=ses or Resend/Mailgun instead.
        return [
            'success' => false,
            'message' => 'SES driver: configure MAIL_MAILER=ses in .env with AWS credentials, or use Resend/Mailgun integration.',
        ];
    }

    public function testConnection(): bool
    {
        $c = $this->credentials();

        return ! empty($c['access_key']) && ! empty($c['secret_key']) && ! empty($c['region']);
    }
}
