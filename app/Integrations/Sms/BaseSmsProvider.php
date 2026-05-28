<?php

namespace App\Integrations\Sms;

use App\Contracts\Integrations\SmsProviderInterface;
use App\Models\Integration;

abstract class BaseSmsProvider implements SmsProviderInterface
{
    protected ?Integration $integration = null;

    public function setIntegration(Integration $integration): static
    {
        $this->integration = $integration;

        return $this;
    }

    protected function credentials(): array
    {
        return $this->integration?->credentials ?? [];
    }
}
