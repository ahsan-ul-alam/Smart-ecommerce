<?php

namespace App\Repositories;

use App\Models\Setting;
use App\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Support\Collection;

class SettingRepository implements SettingRepositoryInterface
{
    public function all(): Collection
    {
        return Setting::query()->orderBy('group')->orderBy('key')->get();
    }

    public function getByGroup(string $group): Collection
    {
        return Setting::query()->where('group', $group)->get();
    }

    public function get(string $group, string $key, mixed $default = null): mixed
    {
        $setting = Setting::query()->where('group', $group)->where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        return $this->castValue($setting);
    }

    public function set(string $group, string $key, mixed $value, string $type = 'string'): Setting
    {
        return Setting::query()->updateOrCreate(
            ['group' => $group, 'key' => $key],
            [
                'value' => $this->serializeValue($value, $type),
                'type' => $type,
            ]
        );
    }

    public function setMany(string $group, array $settings): void
    {
        foreach ($settings as $key => $payload) {
            if (is_array($payload)) {
                $this->set($group, $key, $payload['value'] ?? null, $payload['type'] ?? 'string');
            } else {
                $this->set($group, $key, $payload);
            }
        }
    }

    protected function castValue(Setting $setting): mixed
    {
        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $setting->value,
            'json' => json_decode($setting->value ?? 'null', true),
            default => $setting->value,
        };
    }

    protected function serializeValue(mixed $value, string $type): ?string
    {
        if ($type === 'json') {
            return json_encode($value);
        }

        if ($type === 'boolean') {
            return $value ? '1' : '0';
        }

        return $value === null ? null : (string) $value;
    }
}
