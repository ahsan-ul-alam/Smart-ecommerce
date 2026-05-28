<?php

namespace App\Contracts\Integrations;

interface PaymentGatewayInterface
{
    public function getProvider(): string;

    public function initiatePayment(array $payload): array;

    public function verifyPayment(array $payload): array;

    public function refundPayment(array $payload): array;

    public function testConnection(): bool;
}
