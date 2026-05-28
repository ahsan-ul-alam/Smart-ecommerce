<?php

namespace App\Contracts\Integrations;

interface EmailProviderInterface
{
    public function getProvider(): string;

    public function send(array $payload): array;

    public function testConnection(): bool;
}
