<?php

namespace App\Contracts\Integrations;

interface CourierInterface
{
    public function getProvider(): string;

    public function createConsignment(array $payload): array;

    public function trackShipment(string $trackingId): array;

    public function cancelConsignment(string $trackingId): array;

    public function testConnection(): bool;
}
