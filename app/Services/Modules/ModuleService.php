<?php

namespace App\Services\Modules;

use App\Models\Module;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ModuleService
{
    private const CACHE_KEY = 'arcommerze.modules';

    public function all(): Collection
    {
        return Cache::remember(self::CACHE_KEY, 3600, fn () => Module::query()->orderBy('sort_order')->get());
    }

    public function isEnabled(string $key): bool
    {
        $module = $this->all()->firstWhere('key', $key);

        return $module?->is_enabled ?? false;
    }

    public function enabledKeys(): array
    {
        return $this->all()->where('is_enabled', true)->pluck('key')->all();
    }

    public function toggle(string $key, bool $enabled): Module
    {
        $module = Module::query()->where('key', $key)->firstOrFail();
        $module->update(['is_enabled' => $enabled]);
        Cache::forget(self::CACHE_KEY);

        return $module->fresh();
    }

    public function syncFromConfig(): void
    {
        $modules = config('arcommerze.modules', []);
        $order = 0;

        foreach ($modules as $key => $meta) {
            Module::query()->updateOrCreate(
                ['key' => $key],
                [
                    'label' => $meta['label'] ?? $key,
                    'group' => $meta['group'] ?? 'general',
                    'sort_order' => $order++,
                ]
            );
        }

        Cache::forget(self::CACHE_KEY);
    }
}
