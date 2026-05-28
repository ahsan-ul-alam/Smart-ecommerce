<?php

namespace App\Integrations\Couriers;

use App\Contracts\Integrations\CourierInterface;
use App\Models\Integration;

abstract class BaseCourier implements CourierInterface
{
    protected ?Integration $integration = null;

    public function setIntegration(Integration $integration): static
    {
        $this->integration = $integration;

        return $this;
    }

    public function testConnection(): bool
    {
        return $this->integration?->is_enabled ?? false;
    }

    public function cancelConsignment(string $trackingId): array
    {
        return ['status' => 'pending', 'tracking_id' => $trackingId];
    }
}
