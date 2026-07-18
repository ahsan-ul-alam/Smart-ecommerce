<?php

namespace App\Models;

use App\Casts\SafeEncryptedArray;
use App\Domain\Enums\IntegrationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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

    /** The bearer token a courier panel uses to authenticate status webhooks. */
    public function webhookToken(): ?string
    {
        return $this->webhook_config['token'] ?? null;
    }

    /** Return the webhook token, generating and persisting one if it doesn't exist yet. */
    public function ensureWebhookToken(): string
    {
        if (empty($this->webhook_config['token'])) {
            return $this->regenerateWebhookToken();
        }

        return $this->webhook_config['token'];
    }

    public function regenerateWebhookToken(): string
    {
        $token = 'cwh_'.Str::random(48);
        $this->webhook_config = array_merge($this->webhook_config ?? [], ['token' => $token]);
        $this->save();

        return $token;
    }
}
