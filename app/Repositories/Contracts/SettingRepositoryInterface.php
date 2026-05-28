<?php

namespace App\Repositories\Contracts;

use App\Models\Setting;
use Illuminate\Support\Collection;

interface SettingRepositoryInterface
{
    public function all(): Collection;

    public function getByGroup(string $group): Collection;

    public function get(string $group, string $key, mixed $default = null): mixed;

    public function set(string $group, string $key, mixed $value, string $type = 'string'): Setting;

    public function setMany(string $group, array $settings): void;
}
