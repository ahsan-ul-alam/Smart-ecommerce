<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Commerce\RecentlyViewedService;
use App\Services\Commerce\ShopCatalogService;
use App\Services\Marketing\FlashSaleService;
use App\Support\MediaUrl;
use Illuminate\Http\JsonResponse;
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

    public function suggest(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));

        if (mb_strlen($term) < 2) {
            return response()->json(['products' => []]);
        }

        $like = '%'.$term.'%';

        $products = Product::query()
            ->published()
            ->when($request->filled('category'), fn ($q) => $q->where('category_id', $request->query('category')))
            ->where(fn ($q) => $q->where('name', 'like', $like)->orWhere('sku', 'like', $like))
            ->with(['images', 'category:id,name'])
            ->orderByRaw('CASE WHEN name LIKE ? THEN 0 ELSE 1 END', [$term.'%']) // prefix matches first
            ->orderBy('name')
            ->limit(8)
            ->get();

        return response()->json([
            'products' => $products->map(function (Product $p) {
                $primary = $p->images->firstWhere('is_primary', true) ?? $p->images->first();

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price' => (float) $p->price,
                    'compare_price' => $p->compare_price ? (float) $p->compare_price : null,
                    'category' => $p->category?->name,
                    'image' => MediaUrl::resolve($primary?->path),
                ];
            }),
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

        $breakdownCounts = $product->approvedReviews()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');
        $ratingBreakdown = collect([5, 4, 3, 2, 1])
            ->map(fn ($star) => ['star' => $star, 'count' => (int) ($breakdownCounts[$star] ?? 0)])
            ->values();

        $questions = $product->questions()
            ->where('is_published', true)
            ->with('user:id,name')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($q) => [
                'id' => $q->id,
                'name' => $q->user?->name ?? $q->guest_name ?? 'Customer',
                'question' => $q->question,
                'answer' => $q->answer,
                'answered_at' => $q->answered_at?->toISOString(),
                'created_at' => $q->created_at?->toISOString(),
            ]);

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
            'ratingBreakdown' => $ratingBreakdown,
            'questions' => $questions,
            'inWishlist' => $request->user()
                ? $request->user()->wishlists()->where('product_id', $product->id)->exists()
                : false,
        ]);
    }

    public function askQuestion(Request $request, string $slug): \Illuminate\Http\RedirectResponse
    {
        $product = Product::query()->published()->where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'question' => ['required', 'string', 'min:5', 'max:1000'],
            'guest_name' => ['nullable', 'string', 'max:100'],
        ]);

        $product->questions()->create([
            'user_id' => $request->user()?->id,
            'guest_name' => $request->user() ? null : ($data['guest_name'] ?? null),
            'question' => $data['question'],
            'is_published' => true,
        ]);

        return back()->with('success', 'Your question has been submitted. We will answer it shortly.');
    }
}
