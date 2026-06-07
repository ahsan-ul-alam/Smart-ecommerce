<?php

namespace App\Models;

use App\Domain\Enums\CouponType;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'min_order_amount',
        'max_uses', 'used_count', 'starts_at', 'expires_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function isValid(float $subtotal): bool
    {
        return $this->validationMessage($subtotal) === null;
    }

    public function validationMessage(float $subtotal): ?string
    {
        if (! $this->is_active) {
            return 'This coupon is no longer active.';
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'This coupon is not active yet.';
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'This coupon has expired.';
        }

        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return 'This coupon has reached its usage limit.';
        }

        if ($this->min_order_amount && $subtotal < (float) $this->min_order_amount) {
            return 'Minimum order amount of ৳'.number_format((float) $this->min_order_amount, 0).' required for this coupon.';
        }

        return null;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if (! $this->isValid($subtotal)) {
            return 0;
        }

        return match ($this->type) {
            CouponType::Percent => round($subtotal * ($this->value / 100), 2),
            CouponType::Fixed => min($this->value, $subtotal),
        };
    }
}
