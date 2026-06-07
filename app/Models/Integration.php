<?php

namespace App\Models;

use App\Casts\SafeEncryptedArray;
use App\Domain\Enums\IntegrationType;
use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    protected $fillable = [
        'type',
        'provider',
        'label',
        'is_enabled',
        'is_sandbox',
        'priority',
        'credentials',
        'config',
        'webhook_config',
    ];

    protected function casts(): array
    {
        return [
            'type' => IntegrationType::class,
            'is_enabled' => 'boolean',
            'is_sandbox' => 'boolean',
            'credentials' => SafeEncryptedArray::class,
            'config' => 'array',
            'webhook_config' => 'array',
        ];
    }
}
