<?php

namespace App\Services\Integrations;

use App\Contracts\Integrations\CourierInterface;
use App\Contracts\Integrations\EmailProviderInterface;
use App\Contracts\Integrations\PaymentGatewayInterface;
use App\Contracts\Integrations\SmsProviderInterface;
use App\Domain\Enums\IntegrationType;
use App\Models\Integration;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class IntegrationManager
{
    /** @var array<string, array<string, class-string>> */
    protected array $drivers = [
        IntegrationType::Payment->value => [],
        IntegrationType::Courier->value => [],
        IntegrationType::Sms->value => [],
        IntegrationType::Email->value => [],
    ];

    public function register(IntegrationType $type, string $provider, string $class): void
    {
        $this->drivers[$type->value][$provider] = $class;
    }

    public function getEnabled(IntegrationType $type): Collection
    {
        return Integration::query()
            ->where('type', $type->value)
            ->where('is_enabled', true)
            ->orderBy('priority')
            ->get();
    }

    public function resolvePayment(string $provider): PaymentGatewayInterface
    {
        return $this->resolve(IntegrationType::Payment, $provider, PaymentGatewayInterface::class);
    }

    public function resolveCourier(string $provider): CourierInterface
    {
        return $this->resolve(IntegrationType::Courier, $provider, CourierInterface::class);
    }

    public function resolveSms(string $provider): SmsProviderInterface
    {
        return $this->resolve(IntegrationType::Sms, $provider, SmsProviderInterface::class);
    }

    public function resolveEmail(string $provider): EmailProviderInterface
    {
        return $this->resolve(IntegrationType::Email, $provider, EmailProviderInterface::class);
    }

    protected function resolve(IntegrationType $type, string $provider, string $contract): object
    {
        $driverClass = $this->drivers[$type->value][$provider] ?? null;

        if (! $driverClass) {
            throw new InvalidArgumentException("Integration driver [{$provider}] for [{$type->value}] is not registered.");
        }

        $integration = Integration::query()
            ->where('type', $type->value)
            ->where('provider', $provider)
            ->first();

        $instance = app($driverClass);

        if (! $instance instanceof $contract) {
            throw new InvalidArgumentException("Driver [{$driverClass}] must implement {$contract}.");
        }

        if ($integration && method_exists($instance, 'setIntegration')) {
            $instance->setIntegration($integration);
        }

        return $instance;
    }

    public function syncFromConfig(): void
    {
        $this->syncType(IntegrationType::Payment, config('arcommerze.payment_gateways', []));
        $this->syncType(IntegrationType::Courier, config('arcommerze.couriers', []));
        $this->syncType(IntegrationType::Sms, config('arcommerze.sms_providers', []));
        $this->syncType(IntegrationType::Email, config('arcommerze.email_providers', []));
    }

    protected function syncType(IntegrationType $type, array $providers): void
    {
        $priority = 0;
        foreach ($providers as $key => $label) {
            $resolvedLabel = is_array($label) ? ($label['label'] ?? $key) : (is_string($label) ? $label : $key);
            $integration = Integration::query()->firstOrNew([
                'type' => $type->value,
                'provider' => $key,
            ]);

            if (! $integration->exists) {
                $integration->is_enabled = $key === 'cod';
            }

            $integration->label = $resolvedLabel;
            $integration->priority = $priority++;
            $integration->save();
        }
    }
}
