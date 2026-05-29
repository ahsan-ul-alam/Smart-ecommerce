<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecialProduct extends Model
{
    protected $fillable = [
        'name', 'slug', 'product_id', 'headline', 'subheadline', 'hero_image',
        'blocks', 'schema', 'schema_version', 'theme', 'is_published', 'status',
        'published_at', 'scheduled_at', 'seo_title', 'seo_description', 'og_image', 'canonical_url',
    ];

    protected function casts(): array
    {
        return [
            'blocks' => 'array',
            'schema' => 'array',
            'theme' => 'array',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'scheduled_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function versions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LandingPageVersion::class)->orderByDesc('version_number');
    }
}
