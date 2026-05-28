<?php

namespace App\Models;

use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentMethod;
use App\Domain\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'source', 'user_id', 'created_by', 'guest_name', 'guest_email', 'guest_phone',
        'status', 'payment_status', 'payment_method',
        'subtotal', 'discount_amount', 'loyalty_points_used', 'loyalty_discount',
        'loyalty_points_earned', 'wallet_amount_used', 'shipping_amount', 'tax_amount', 'total',
        'coupon_id', 'coupon_code', 'payment_reference', 'shipping_address', 'billing_address',
        'customer_note', 'admin_note', 'paid_at', 'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'payment_method' => PaymentMethod::class,
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'loyalty_discount' => 'decimal:2',
            'wallet_amount_used' => 'decimal:2',
            'shipping_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'paid_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->latest();
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function shipment(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(OrderShipment::class);
    }

    public function returnRequest(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(OrderReturnRequest::class);
    }

    public function customerName(): string
    {
        return $this->user?->name ?? $this->guest_name ?? 'Guest';
    }
}
