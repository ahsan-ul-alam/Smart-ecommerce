<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecialProduct extends Model
{
    protected $fillable = [
        'name', 'slug', 'product_id', 'headline', 'subheadline', 'hero_image',
        'blocks', 'theme', 'is_published', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'blocks' => 'array',
            'theme' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
