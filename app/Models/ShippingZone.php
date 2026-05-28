<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    protected $fillable = [
        'name',
        'districts',
        'shipping_charge',
        'free_shipping_min',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'districts' => 'array',
            'shipping_charge' => 'decimal:2',
            'free_shipping_min' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
