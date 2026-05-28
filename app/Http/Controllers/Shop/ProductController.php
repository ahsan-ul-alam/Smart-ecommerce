<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Commerce\RecentlyViewedService;
use App\Services\Commerce\ShopCatalogService;
use App\Services\Marketing\FlashSaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected FlashSaleService $flashSales,
        protected RecentlyViewedService $recentlyViewed,
        protected ShopCatalogService $catalog,
    ) {}

    public function index(Request $request): Response
    {
        $query = $this->catalog->applyFilters($this->catalog->baseQuery(), $request);

        $products = $query->paginate(12)->withQueryString();

        $this->flashSales->hydrateCache($products->pluck('id')->all());

        $categories = $this->catalog->categoriesWithCounts();
        $priceBounds = $this->catalog->priceBounds();

        return Inertia::render('Shop/Products/Index', [
            'products' => ProductResource::collection($products),
            'categories' => $categories,
            'catalogMeta' => [
                'total_products' => $this->catalog->totalPublishedCount(),
                'price_min' => $priceBounds['min'],
                'price_max' => $priceBounds['max'],
                'rating_counts' => $this->catalog->ratingCounts(),
            ],
            'filters' => $request->only($this->catalog->filterKeys()),
            'wishlistProductIds' => $request->user()
                ? $request->user()->wishlists()->pluck('product_id')->all()
                : [],
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $product = Product::query()
            ->published()
            ->where('slug', $slug)
            ->with(['category', 'brand', 'images', 'variants'])
            ->withAvg(['approvedReviews as avg_rating'], 'rating')
            ->withCount('approvedReviews as reviews_count')
            ->firstOrFail();

        $related = Product::query()
            ->published()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category:id,name', 'brand:id,name', 'images'])
            ->withAvg(['approvedReviews as avg_rating'], 'rating')
            ->withCount('approvedReviews as reviews_count')
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
            'avgRating' => round($product->avg_rating ?? $product->approvedReviews()->avg('rating') ?? 0, 1),
            'inWishlist' => $request->user()
                ? $request->user()->wishlists()->where('product_id', $product->id)->exists()
                : false,
        ]);
    }
}
