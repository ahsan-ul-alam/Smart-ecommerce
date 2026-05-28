<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    protected $fillable = [
        'user_id', 'label', 'name', 'phone', 'email',
        'division', 'district', 'thana', 'local_address',
        'address_line_1', 'address_line_2', 'city',
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
        if ($this->division) {
            return [
                'name' => $this->name,
                'phone' => $this->phone,
                'email' => $this->email,
                'division' => $this->division,
                'district' => $this->district,
                'thana' => $this->thana,
                'local_address' => $this->local_address,
                'address_line_1' => $this->local_address,
                'address_line_2' => null,
                'city' => $this->thana,
                'postal_code' => $this->postal_code,
                'country' => $this->country ?? 'Bangladesh',
            ];
        }

        return $this->only([
            'name', 'phone', 'email', 'address_line_1', 'address_line_2',
            'city', 'district', 'postal_code', 'country',
        ]);
    }
}
