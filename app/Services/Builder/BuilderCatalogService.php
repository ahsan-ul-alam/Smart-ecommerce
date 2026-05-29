<?php

namespace App\Services\Builder;

use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\Marketing\FlashSaleService;
use Illuminate\Support\Collection;

class BuilderCatalogService
{
    public function __construct(protected FlashSaleService $flashSales) {}

    public function editorPayload(): array
    {
        return [
            'products' => Product::query()->published()->with('images')->latest()->limit(24)->get()
                ->map(fn ($p) => (new ProductResource($p))->resolve()),
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->limit(20)->get(['id', 'name', 'slug']),
            'brands' => Brand::query()->where('is_active', true)->orderBy('name')->limit(20)->get(['id', 'name', 'slug']),
            'flashSale' => $this->flashSales->activeSales()->first(),
        ];
    }

    public function resolveForSchema(array $schema): array
    {
        $sources = $this->collectDataSources($schema);

        return [
            'products' => $this->resolveProducts($sources),
            'categories' => Category::query()->whereIn('id', $sources['category_ids'])->get(['id', 'name', 'slug']),
            'flashSale' => $this->flashSales->activeSales()->first(),
            'flashProducts' => $this->flashSales->activeSales()->first()?->products
                ?->take(12)
                ->map(fn ($p) => (new ProductResource($p))->resolve()) ?? collect(),
        ];
    }

    protected function collectDataSources(array $schema): array
    {
        $productIds = [];
        $categoryIds = [];
        $sources = [];

        $walk = function (array $nodes) use (&$walk, &$productIds, &$categoryIds, &$sources): void {
            foreach ($nodes as $node) {
                $ds = $node['props']['dataSource'] ?? null;
                if ($ds) {
                    $sources[] = $ds;
                    if (($ds['type'] ?? '') === 'manual' && ! empty($ds['product_ids'])) {
                        $productIds = array_merge($productIds, $ds['product_ids']);
                    }
                    if (($ds['type'] ?? '') === 'category' && ! empty($ds['category_id'])) {
                        $categoryIds[] = $ds['category_id'];
                    }
                }
                if (! empty($node['children'])) {
                    $walk($node['children']);
                }
            }
        };

        $walk($schema['roots'] ?? []);

        return [
            'sources' => $sources,
            'product_ids' => array_values(array_unique($productIds)),
            'category_ids' => array_values(array_unique($categoryIds)),
        ];
    }

    protected function resolveProducts(array $sources): Collection
    {
        $ids = $sources['product_ids'];

        foreach ($sources['sources'] as $ds) {
            $type = $ds['type'] ?? 'featured';
            $limit = min(24, (int) ($ds['limit'] ?? 8));

            $query = match ($type) {
                'featured' => Product::query()->published()->where('is_featured', true),
                'trending' => Product::query()->published()->inRandomOrder(),
                'new' => Product::query()->published()->latest(),
                'best_selling' => Product::query()->published()->latest(),
                'flash_sale' => Product::query()->published()->whereIn(
                    'id',
                    $this->flashSales->activeSales()->flatMap(fn ($s) => $s->products->pluck('id'))->unique()->all() ?: [0]
                ),
                'category' => Product::query()->published()->when(
                    ! empty($ds['category_id']),
                    fn ($q) => $q->where('category_id', $ds['category_id'])
                ),
                'manual' => Product::query()->published()->whereIn('id', $ds['product_ids'] ?? []),
                default => Product::query()->published()->where('is_featured', true),
            };

            $ids = array_merge($ids, $query->with('images')->limit($limit)->pluck('id')->all());
        }

        $ids = array_values(array_unique($ids));

        if (empty($ids)) {
            return Product::query()->published()->with('images')->limit(8)->get()
                ->map(fn ($p) => (new ProductResource($p))->resolve());
        }

        return Product::query()->published()->with('images')->whereIn('id', $ids)->get()
            ->map(fn ($p) => (new ProductResource($p))->resolve());
    }
}
