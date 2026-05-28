<?php

namespace App\Services\Catalog;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductImageService
{
    public function store(Product $product, UploadedFile $file, ?string $alt = null): ProductImage
    {
        $path = $file->store("products/{$product->id}", 'public');

        $isFirst = ! $product->images()->exists();

        return ProductImage::query()->create([
            'product_id' => $product->id,
            'path' => $path,
            'alt' => $alt ?? $product->name,
            'sort_order' => (int) $product->images()->max('sort_order') + 1,
            'is_primary' => $isFirst,
        ]);
    }

    public function delete(ProductImage $image): void
    {
        if (! str_starts_with($image->path, 'http')) {
            Storage::disk('public')->delete($image->path);
        }

        $wasPrimary = $image->is_primary;
        $productId = $image->product_id;
        $image->delete();

        if ($wasPrimary) {
            $next = ProductImage::query()->where('product_id', $productId)->orderBy('sort_order')->first();
            $next?->update(['is_primary' => true]);
        }
    }

    public function setPrimary(ProductImage $image): void
    {
        ProductImage::query()
            ->where('product_id', $image->product_id)
            ->update(['is_primary' => false]);

        $image->update(['is_primary' => true]);
    }
}
