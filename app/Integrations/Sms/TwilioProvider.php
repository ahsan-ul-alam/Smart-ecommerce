<?php

namespace App\Integrations\Sms;

use Illuminate\Support\Facades\Http;

class TwilioProvider extends BaseSmsProvider
{
    public function getProvider(): string
    {
        return 'twilio';
    }

    public function send(string $to, string $message, array $options = []): array
    {
        $c = $this->credentials();
        if (empty($c['sid']) || empty($c['token'])) {
            return ['success' => true, 'demo' => true, 'message' => 'SMS logged (Twilio not configured)'];
        }

        $from = $c['from'] ?? '';
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$c['sid']}/Messages.json";

        $response = Http::withBasicAuth($c['sid'], $c['token'])
            ->asForm()
            ->post($url, ['From' => $from, 'To' => $to, 'Body' => $message]);

        return ['success' => $response->successful(), 'raw' => $response->json()];
    }

    public function testConnection(): bool
    {
        return ! empty($this->credentials()['sid']);
    }
}
