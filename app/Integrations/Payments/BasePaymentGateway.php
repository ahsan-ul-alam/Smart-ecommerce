<?php

namespace App\Integrations\Payments;

use App\Contracts\Integrations\PaymentGatewayInterface;
use App\Models\Integration;

abstract class BasePaymentGateway implements PaymentGatewayInterface
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

    public function refundPayment(array $payload): array
    {
        return ['status' => 'pending', 'message' => 'Refund not implemented for '.$this->getProvider()];
    }
}
