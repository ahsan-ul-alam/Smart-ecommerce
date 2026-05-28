<?php

namespace App\Integrations\Email;

use App\Contracts\Integrations\EmailProviderInterface;
use App\Models\Integration;

abstract class BaseEmailProvider implements EmailProviderInterface
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
