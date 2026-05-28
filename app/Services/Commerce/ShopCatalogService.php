<?php

namespace App\Services\Commerce;

use App\Domain\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ShopCatalogService
{
    public function baseQuery(): Builder
    {
        return Product::query()
            ->published()
            ->with(['category:id,name', 'brand:id,name', 'images'])
            ->withAvg(['approvedReviews as avg_rating'], 'rating')
            ->withCount('approvedReviews as reviews_count');
    }

    public function applyFilters(Builder $query, Request $request): Builder
    {
        return $query
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->category, fn ($q, $c) => $q->where('category_id', $c))
            ->when($request->brand, fn ($q, $b) => $q->where('brand_id', $b))
            ->when($request->featured, fn ($q) => $q->where('is_featured', true))
            ->when($request->filled('min_price') || $request->filled('max_price'), function ($q) use ($request) {
                $min = $request->filled('min_price') ? (float) $request->min_price : null;
                $max = $request->filled('max_price') ? (float) $request->max_price : null;

                if ($min !== null && $max !== null && $min > $max) {
                    [$min, $max] = [$max, $min];
                }

                if ($min !== null) {
                    $q->where('price', '>=', $min);
                }
                if ($max !== null) {
                    $q->where('price', '<=', $max);
                }
            })
            ->when($request->filled('rating'), function ($q) use ($request) {
                $min = (int) $request->rating;
                $q->whereRaw(
                    '(SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_reviews.product_id = products.id AND is_approved = 1) >= ?',
                    [$min]
                );
            })
            ->when($request->sort === 'price_asc', fn ($q) => $q->orderBy('price'))
            ->when($request->sort === 'price_desc', fn ($q) => $q->orderByDesc('price'))
            ->when($request->sort === 'name', fn ($q) => $q->orderBy('name'))
            ->when(! in_array($request->sort, ['price_asc', 'price_desc', 'name'], true), fn ($q) => $q->latest());
    }

    public function categoriesWithCounts(): Collection
    {
        return Category::query()
            ->where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->where('status', ProductStatus::Published)])
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'products_count' => $c->products_count,
            ]);
    }

    public function totalPublishedCount(): int
    {
        return Product::query()->published()->count();
    }

    public function priceBounds(): array
    {
        $row = Product::query()
            ->published()
            ->selectRaw('COALESCE(MIN(price), 0) as min_price, COALESCE(MAX(price), 0) as max_price')
            ->first();

        $min = (float) ($row->min_price ?? 0);
        $max = (float) ($row->max_price ?? 0);

        if ($max <= $min) {
            $max = max($min + 1, 10000);
        }

        return [
            'min' => (int) floor($min),
            'max' => (int) ceil($max),
        ];
    }

    /** @return array<int, int> */
    public function ratingCounts(): array
    {
        $counts = [];
        for ($stars = 5; $stars >= 1; $stars--) {
            $counts[$stars] = Product::query()
                ->published()
                ->whereRaw(
                    '(SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_reviews.product_id = products.id AND is_approved = 1) >= ?',
                    [$stars]
                )
                ->count();
        }

        return $counts;
    }

    public function filterKeys(): array
    {
        return ['search', 'category', 'brand', 'featured', 'sort', 'min_price', 'max_price', 'rating'];
    }
}
