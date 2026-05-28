<?php

namespace App\Models;

use App\Domain\Enums\ReturnRequestStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderReturnRequest extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'status',
        'return_type',
        'partial_amount',
        'exchange_product_id',
        'reason',
        'customer_note',
        'admin_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ReturnRequestStatus::class,
            'partial_amount' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    public function exchangeProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'exchange_product_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
