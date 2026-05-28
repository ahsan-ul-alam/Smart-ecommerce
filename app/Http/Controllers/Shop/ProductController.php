<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Services\Commerce\RecentlyViewedService;
use App\Services\Marketing\FlashSaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected FlashSaleService $flashSales,
        protected RecentlyViewedService $recentlyViewed,
    ) {}

    public function index(Request $request): Response
    {
        $products = Product::query()
            ->published()
            ->with(['category:id,name', 'brand:id,name', 'images'])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->category, fn ($q, $c) => $q->where('category_id', $c))
            ->when($request->featured, fn ($q) => $q->where('is_featured', true))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $this->flashSales->hydrateCache($products->pluck('id')->all());

        return Inertia::render('Shop/Products/Index', [
            'products' => ProductResource::collection($products),
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'category', 'featured']),
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $product = Product::query()
            ->published()
            ->where('slug', $slug)
            ->with(['category', 'brand', 'images', 'variants'])
            ->firstOrFail();

        $related = Product::query()
            ->published()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        $reviews = $product->approvedReviews()->with('user:id,name')->latest()->limit(10)->get();

        $relatedIds = $related->pluck('id')->all();
        $this->flashSales->hydrateCache(array_merge([$product->id], $relatedIds));
        $this->recentlyViewed->track($request, $product->id);

        $recent = $this->recentlyViewed->products($request, $product->id, 6);

        return Inertia::render('Shop/Products/Show', [
            'product' => (new ProductResource($product))->resolve(),
            'related' => ProductResource::collection($related)->resolve(),
            'recentlyViewed' => ProductResource::collection($recent)->resolve(),
            'reviews' => $reviews->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->user?->name ?? $r->guest_name,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at?->toISOString(),
            ]),
            'avgRating' => round($product->approvedReviews()->avg('rating') ?? 0, 1),
            'inWishlist' => $request->user()
                ? $request->user()->wishlists()->where('product_id', $product->id)->exists()
                : false,
        ]);
    }
}
