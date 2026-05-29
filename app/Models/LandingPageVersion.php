<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPageVersion extends Model
{
    protected $fillable = [
        'special_product_id', 'version_number', 'schema', 'meta', 'type', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'schema' => 'array',
            'meta' => 'array',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(SpecialProduct::class, 'special_product_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
