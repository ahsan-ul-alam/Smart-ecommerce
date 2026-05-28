<?php

namespace App\Http\Resources;

use App\Services\Marketing\FlashSaleService;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primary = $this->relationLoaded('images')
            ? ($this->images->firstWhere('is_primary', true) ?? $this->images->first())
            : $this->primaryImage();

        $flash = app(FlashSaleService::class)->getForProduct($this->id);
        $originalPrice = (float) $this->price;
        $displayPrice = $flash ? $flash['sale_price'] : $originalPrice;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'type' => $this->type?->value,
            'status' => $this->status?->value,
            'price' => $displayPrice,
            'original_price' => $flash ? $originalPrice : null,
            'on_sale' => (bool) $flash,
            'flash_sale' => $flash ? [
                'title' => $flash['title'],
                'slug' => $flash['slug'],
                'ends_at' => $flash['ends_at'],
                'remaining' => $flash['remaining'],
            ] : null,
            'compare_price' => $this->compare_price ? (float) $this->compare_price : null,
            'cost_price' => $this->cost_price ? (float) $this->cost_price : null,
            'stock_quantity' => $this->stock_quantity,
            'low_stock_threshold' => $this->low_stock_threshold,
            'track_inventory' => $this->track_inventory,
            'is_featured' => $this->is_featured,
            'is_low_stock' => $this->isLowStock(),
            'weight' => $this->weight,
            'tags' => $this->tags ?? [],
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'vendor_id' => $this->vendor_id,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
            ] : null),
            'image' => MediaUrl::resolve($primary?->path),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => [
                'id' => $img->id,
                'url' => MediaUrl::resolve($img->path),
                'alt' => $img->alt,
                'is_primary' => $img->is_primary,
                'sort_order' => $img->sort_order,
            ])),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'sku' => $v->sku,
                'price' => $v->price ? (float) $v->price : null,
                'stock_quantity' => (int) $v->stock_quantity,
                'attributes' => $v->attributes ?? [],
                'is_active' => $v->is_active,
            ])),
            'has_variants' => $this->relationLoaded('variants')
                ? $this->variants->where('is_active', true)->isNotEmpty()
                : false,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
