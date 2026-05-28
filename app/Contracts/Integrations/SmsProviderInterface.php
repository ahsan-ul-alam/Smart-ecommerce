<?php

namespace App\Contracts\Integrations;

interface SmsProviderInterface
{
    public function getProvider(): string;

    public function send(string $to, string $message, array $options = []): array;

    public function testConnection(): bool;
}
