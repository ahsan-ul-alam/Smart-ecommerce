<?php

namespace App\Services\Catalog;

use App\Domain\Enums\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(
        protected ProductRepository $products,
    ) {}

    public function create(array $data): Product
    {
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);
        $data['sku'] = $data['sku'] ?? $this->generateSku();

        return $this->products->create($data);
    }

    public function update(Product $product, array $data): Product
    {
        if (isset($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $product->id);
        }

        return $this->products->update($product, $data);
    }

    public function syncVariants(Product $product, array $variants): void
    {
        $keepIds = [];

        foreach ($variants as $row) {
            if (empty($row['name'])) {
                continue;
            }

            $attributes = $row['attributes'] ?? [];
            if (! empty($row['size'])) {
                $attributes['size'] = $row['size'];
            }
            if (! empty($row['color'])) {
                $attributes['color'] = $row['color'];
            }

            $payload = [
                'name' => $row['name'],
                'sku' => $row['sku'] ?? null,
                'price' => isset($row['price']) && $row['price'] !== '' ? (float) $row['price'] : null,
                'stock_quantity' => (int) ($row['stock_quantity'] ?? 0),
                'attributes' => $attributes,
                'is_active' => (bool) ($row['is_active'] ?? true),
            ];

            if (! empty($row['id'])) {
                $variant = $product->variants()->where('id', $row['id'])->first();
                if ($variant) {
                    $variant->update($payload);
                    $keepIds[] = $variant->id;
                }
            } else {
                $variant = $product->variants()->create($payload);
                $keepIds[] = $variant->id;
            }
        }

        $product->variants()->whereNotIn('id', $keepIds)->delete();
    }

    public function duplicate(Product $product): Product
    {
        $copy = $product->replicate(['slug', 'sku']);
        $copy->name = $product->name.' (Copy)';
        $copy->slug = $this->uniqueSlug($product->slug.'-copy');
        $copy->sku = $this->generateSku();
        $copy->status = \App\Domain\Enums\ProductStatus::Draft;
        $copy->save();

        foreach ($product->images as $image) {
            $copy->images()->create([
                'path' => $image->path,
                'alt' => $image->alt,
                'sort_order' => $image->sort_order,
                'is_primary' => $image->is_primary,
            ]);
        }

        return $copy->fresh(['images']);
    }

    public function adjustStock(Product $product, int $quantity, InventoryMovementType $type, ?string $notes = null, ?int $userId = null): Product
    {
        $before = $product->stock_quantity;
        $after = match ($type) {
            InventoryMovementType::In, InventoryMovementType::Restock => $before + abs($quantity),
            InventoryMovementType::Out, InventoryMovementType::Damage => max(0, $before - abs($quantity)),
            InventoryMovementType::Adjustment => $quantity,
        };

        $product->update(['stock_quantity' => $after]);

        InventoryMovement::query()->create([
            'product_id' => $product->id,
            'user_id' => $userId,
            'type' => $type,
            'quantity' => abs($quantity),
            'stock_before' => $before,
            'stock_after' => $after,
            'notes' => $notes,
        ]);

        return $product->fresh();
    }

    protected function uniqueSlug(string $value, ?int $exceptId = null): string
    {
        $slug = Str::slug($value);
        $original = $slug;
        $count = 1;

        while (Product::query()->where('slug', $slug)->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))->exists()) {
            $slug = $original.'-'.$count;
            $count++;
        }

        return $slug;
    }

    protected function generateSku(): string
    {
        do {
            $sku = 'SKU-'.strtoupper(Str::random(8));
        } while (Product::query()->where('sku', $sku)->exists());

        return $sku;
    }
}
