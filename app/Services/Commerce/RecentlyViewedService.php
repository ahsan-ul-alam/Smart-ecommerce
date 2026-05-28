<?php

namespace App\Services\Commerce;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class RecentlyViewedService
{
    public const SESSION_KEY = 'recently_viewed_products';

    public const MAX_ITEMS = 12;

    public function track(Request $request, int $productId): void
    {
        $ids = $this->ids($request);
        $ids = array_values(array_filter($ids, fn ($id) => $id !== $productId));
        array_unshift($ids, $productId);
        $ids = array_slice($ids, 0, self::MAX_ITEMS);

        $request->session()->put(self::SESSION_KEY, $ids);
    }

    public function products(Request $request, ?int $excludeId = null, int $limit = 8): Collection
    {
        $ids = collect($this->ids($request))
            ->when($excludeId, fn ($c) => $c->reject(fn ($id) => $id === $excludeId))
            ->take($limit)
            ->values()
            ->all();

        if (empty($ids)) {
            return collect();
        }

        $products = Product::query()
            ->published()
            ->with(['images', 'category:id,name'])
            ->whereIn('id', $ids)
            ->get();

        return $products
            ->sortBy(fn ($p) => array_search($p->id, $ids, true))
            ->values();
    }

    protected function ids(Request $request): array
    {
        $ids = $request->session()->get(self::SESSION_KEY, []);

        return array_values(array_filter(array_map('intval', (array) $ids)));
    }
}
