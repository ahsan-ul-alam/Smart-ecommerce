<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ProductRepository
{
    public function query(array $filters = []): Builder
    {
        $query = Product::query()
            ->with(['category:id,name', 'brand:id,name', 'images'])
            ->latest();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (! empty($filters['low_stock'])) {
            $query->lowStock();
        }

        return $query;
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->query($filters)->paginate($perPage)->withQueryString();
    }

    public function find(int $id): Product
    {
        return Product::query()
            ->with(['category', 'brand', 'images', 'variants', 'inventoryMovements' => fn ($q) => $q->limit(10)])
            ->findOrFail($id);
    }

    public function create(array $data): Product
    {
        return Product::query()->create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['category', 'brand', 'images']);
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    public function count(): int
    {
        return Product::query()->count();
    }

    public function countLowStock(): int
    {
        return Product::query()->lowStock()->count();
    }

    public function countPublished(): int
    {
        return Product::query()->published()->count();
    }
}
