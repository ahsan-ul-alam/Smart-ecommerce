<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    protected $fillable = [
        'user_id', 'label', 'name', 'phone', 'email',
        'address_line_1', 'address_line_2', 'city', 'district',
        'postal_code', 'country', 'is_default',
    ];

    protected function casts(): array
    {
        return ['is_default' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toShippingArray(): array
    {
        return $this->only([
            'name', 'phone', 'email', 'address_line_1', 'address_line_2',
            'city', 'district', 'postal_code', 'country',
        ]);
    }
}
