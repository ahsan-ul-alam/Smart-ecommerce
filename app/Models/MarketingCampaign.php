<?php

namespace App\Models;

use App\Domain\Enums\CampaignType;
use App\Domain\Enums\CouponType;
use Illuminate\Database\Eloquent\Model;

class MarketingCampaign extends Model
{
    protected $fillable = [
        'name', 'type', 'title', 'body', 'image', 'coupon_code',
        'discount_type', 'discount_value', 'cta_label', 'cta_url',
        'show_on', 'dismiss_hours', 'starts_at', 'ends_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => CampaignType::class,
            'discount_type' => CouponType::class,
            'discount_value' => 'decimal:2',
            'show_on' => 'array',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function isRunning(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->ends_at && $this->ends_at->isPast()) {
            return false;
        }

        return true;
    }

    public function matchesPage(string $page): bool
    {
        $pages = $this->show_on ?: ['all'];

        return in_array('all', $pages, true) || in_array($page, $pages, true);
    }
}
