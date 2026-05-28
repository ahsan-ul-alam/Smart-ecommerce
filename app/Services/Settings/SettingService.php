<?php

namespace App\Services\Settings;

use App\Repositories\Contracts\SettingRepositoryInterface;
use App\Support\MediaUrl;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SettingService
{
    private const CACHE_KEY = 'arcommerze.settings';

    public function __construct(
        protected SettingRepositoryInterface $settings,
    ) {}

    public function all(): Collection
    {
        return Cache::remember(self::CACHE_KEY, 3600, fn () => $this->settings->all());
    }

    public function get(string $group, string $key, mixed $default = null): mixed
    {
        return $this->settings->get($group, $key, $default);
    }

    public function getBoolean(string $group, string $key, bool $default = false): bool
    {
        return filter_var($this->get($group, $key, $default), FILTER_VALIDATE_BOOLEAN);
    }

    public function isMaintenanceMode(): bool
    {
        return $this->getBoolean('general', 'maintenance_mode', false);
    }

    public function getGroup(string $group): array
    {
        return $this->settings->getByGroup($group)
            ->mapWithKeys(fn ($setting) => [$setting->key => $this->settings->get($group, $setting->key)])
            ->all();
    }

    public function getPublicSettings(): array
    {
        return $this->all()
            ->where('is_public', true)
            ->mapWithKeys(fn ($s) => ["{$s->group}.{$s->key}" => $this->settings->get($s->group, $s->key)])
            ->all();
    }

    public function updateGroup(string $group, array $data): void
    {
        $this->settings->setMany($group, $data);
        $this->clearCache();
    }

    public function branding(): array
    {
        return [
            'site_name' => $this->get('general', 'site_name', config('arcommerze.name', 'ArCommerze')),
            'site_tagline' => $this->get('general', 'site_tagline', ''),
            'store_phone' => $this->get('general', 'store_phone', ''),
            'store_email' => $this->get('general', 'store_email', ''),
            'store_address' => $this->get('general', 'store_address', ''),
            'currency' => $this->get('general', 'currency', 'BDT'),
            'currency_symbol' => $this->get('general', 'currency_symbol', '৳'),
            'timezone' => $this->get('general', 'timezone', 'Asia/Dhaka'),
            'maintenance_mode' => $this->isMaintenanceMode(),
            'primary_color' => $this->get('theme', 'primary_color', '#0f766e'),
            'secondary_color' => $this->get('theme', 'secondary_color', '#f59e0b'),
            'logo' => MediaUrl::resolve($this->get('theme', 'logo')),
            'favicon' => MediaUrl::resolve($this->get('theme', 'favicon')),
            'dark_mode_default' => $this->getBoolean('theme', 'dark_mode_default', false),
        ];
    }

    public function storeBrandAsset(string $key, $file): string
    {
        $old = $this->get('theme', $key);

        if ($old && ! str_starts_with((string) $old, 'http')) {
            Storage::disk('public')->delete($old);
        }

        $path = $file->store('branding', 'public');
        $this->set('theme', $key, $path);

        return $path;
    }

    public function removeBrandAsset(string $key): void
    {
        $old = $this->get('theme', $key);

        if ($old && ! str_starts_with((string) $old, 'http')) {
            Storage::disk('public')->delete($old);
        }

        $this->set('theme', $key, null);
    }

    public function set(string $group, string $key, mixed $value, string $type = 'string'): void
    {
        $this->settings->set($group, $key, $value, $type);
        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
