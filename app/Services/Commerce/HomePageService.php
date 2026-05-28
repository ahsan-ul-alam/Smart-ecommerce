<?php

namespace App\Services\Commerce;

use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\ProductStatus;
use App\Http\Resources\ProductResource;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Vendor;
use App\Services\Marketing\FlashSaleService;
use App\Services\Modules\ModuleService;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class HomePageService
{
    public function __construct(
        protected FlashSaleService $flashSales,
        protected RecentlyViewedService $recentlyViewed,
        protected ModuleService $modules,
    ) {}

    public function data(Request $request): array
    {
        $productQuery = fn () => Product::query()
            ->published()
            ->with(['category:id,name', 'brand:id,name', 'images'])
            ->withAvg(['approvedReviews as avg_rating'], 'rating')
            ->withCount('approvedReviews as reviews_count');

        $featured = $productQuery()->where('is_featured', true)->latest()->limit(12)->get();
        $newArrivals = $productQuery()->latest()->limit(12)->get();
        $trending = $this->trendingProducts($productQuery);
        $bestSelling = $this->bestSellingProducts($productQuery);

        $allIds = $featured->pluck('id')
            ->merge($newArrivals->pluck('id'))
            ->merge($trending->pluck('id'))
            ->merge($bestSelling->pluck('id'))
            ->unique()
            ->all();

        $flashSales = $this->flashSales->activeSales();
        $flashSale = $flashSales->first();
        $flashProductIds = $flashSales->flatMap(fn ($s) => $s->products->pluck('id'))->unique()->take(12)->all();
        $flashProducts = $productQuery()->whereIn('id', $flashProductIds)->get();

        $this->flashSales->hydrateCache(array_merge($allIds, $flashProducts->pluck('id')->all()));

        $heroBanners = Banner::query()
            ->where('is_active', true)
            ->whereIn('position', ['homepage_hero', 'homepage'])
            ->orderBy('sort_order')
            ->get();

        $campaignBanners = Banner::query()
            ->where('is_active', true)
            ->where('position', 'homepage_campaign')
            ->orderBy('sort_order')
            ->get();

        if ($campaignBanners->isEmpty()) {
            $campaignBanners = Banner::query()
                ->where('is_active', true)
                ->where('position', 'homepage')
                ->orderBy('sort_order')
                ->skip($heroBanners->count())
                ->take(4)
                ->get();
        }

        $categories = Category::query()
            ->where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->where('status', ProductStatus::Published)])
            ->orderByDesc('products_count')
            ->limit(12)
            ->get();

        $brands = Brand::query()
            ->where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->where('status', ProductStatus::Published)])
            ->orderByDesc('products_count')
            ->get()
            ->filter(fn ($b) => $b->products_count > 0)
            ->take(12)
            ->values();

        $reviews = ProductReview::query()
            ->where('is_approved', true)
            ->with(['user:id,name,avatar', 'product:id,name,slug'])
            ->latest()
            ->limit(10)
            ->get();

        $vendors = $this->modules->isEnabled('vendor')
            ? Vendor::query()->where('is_active', true)->has('products')->withCount('products')->orderBy('name')->limit(8)->get()
            : collect();

        $recentlyViewed = $this->recentlyViewed->products($request, null, 8);

        return [
            'heroSlides' => $this->mapBanners($heroBanners, $flashSale),
            'campaignBanners' => $this->mapBanners($campaignBanners),
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'image' => MediaUrl::resolve($c->image),
                'products_count' => $c->products_count,
            ])->values(),
            'featured' => ProductResource::collection($featured)->resolve(),
            'newArrivals' => ProductResource::collection($newArrivals)->resolve(),
            'trending' => ProductResource::collection($trending)->resolve(),
            'bestSelling' => ProductResource::collection($bestSelling)->resolve(),
            'flashSale' => $flashSale ? [
                'title' => $flashSale->title,
                'slug' => $flashSale->slug,
                'ends_at' => $flashSale->ends_at->toISOString(),
                'image' => MediaUrl::resolve($flashSale->image),
            ] : null,
            'flashProducts' => ProductResource::collection($flashProducts)->resolve(),
            'brands' => $brands->map(fn ($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'logo' => MediaUrl::resolve($b->logo),
                'products_count' => $b->products_count,
            ])->values(),
            'reviews' => $reviews->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->user?->name ?? $r->guest_name ?? 'Customer',
                'avatar' => MediaUrl::resolve($r->user?->avatar),
                'rating' => (int) $r->rating,
                'comment' => $r->comment,
                'product_name' => $r->product?->name,
                'product_slug' => $r->product?->slug,
                'created_at' => $r->created_at?->toISOString(),
            ])->values(),
            'vendors' => $vendors->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'slug' => $v->slug,
                'logo' => MediaUrl::resolve($v->logo),
                'products_count' => $v->products_count,
            ])->values(),
            'recentlyViewed' => ProductResource::collection($recentlyViewed)->resolve(),
            'wishlistProductIds' => $request->user()
                ? $request->user()->wishlists()->pluck('product_id')->all()
                : [],
        ];
    }

    protected function trendingProducts(callable $productQuery): Collection
    {
        $ids = $this->bestSellingProductIds(30, 12);

        if ($ids->isEmpty()) {
            return $productQuery()->where('is_featured', true)->latest()->limit(12)->get();
        }

        $products = $productQuery()->whereIn('id', $ids)->get();

        return $ids->map(fn ($id) => $products->firstWhere('id', $id))->filter()->values();
    }

    protected function bestSellingProducts(callable $productQuery): Collection
    {
        $ids = $this->bestSellingProductIds(90, 12);

        if ($ids->isEmpty()) {
            return $productQuery()->orderByDesc('stock_quantity')->limit(12)->get();
        }

        $products = $productQuery()->whereIn('id', $ids)->get();

        return $ids->map(fn ($id) => $products->firstWhere('id', $id))->filter()->values();
    }

    protected function bestSellingProductIds(int $days, int $limit): Collection
    {
        $orderIds = Order::query()
            ->where('created_at', '>=', now()->subDays($days))
            ->whereNotIn('status', [OrderStatus::Cancelled, OrderStatus::Refunded, OrderStatus::Returned])
            ->pluck('id');

        if ($orderIds->isEmpty()) {
            return collect();
        }

        return OrderItem::query()
            ->whereIn('order_id', $orderIds)
            ->whereNotNull('product_id')
            ->selectRaw('product_id, SUM(quantity) as sold')
            ->groupBy('product_id')
            ->orderByDesc('sold')
            ->limit($limit)
            ->pluck('product_id');
    }

    protected function mapBanners(Collection $banners, $flashSale = null): Collection
    {
        $slides = $banners->map(fn ($b) => [
            'id' => $b->id,
            'title' => $b->title,
            'image' => MediaUrl::resolve($b->image),
            'link' => $b->link ?: '/shop/products',
        ]);

        if ($flashSale && ! $slides->contains(fn ($s) => ($s['id'] ?? null) === 'flash')) {
            $flashImage = MediaUrl::resolve($flashSale->image);
            $slides->prepend([
                'id' => 'flash',
                'title' => $flashSale->title,
                'subtitle' => 'Limited time offers',
                'image' => $flashImage,
                'link' => '/shop/flash-sales/'.$flashSale->slug,
                'accent' => ! $flashImage,
            ]);
        }

        if ($slides->isEmpty()) {
            return collect([[
                'id' => 'default',
                'title' => 'Shop Smart, Pay Easy',
                'subtitle' => 'Cash on delivery · Nationwide delivery',
                'image' => null,
                'link' => '/shop/products',
            ]]);
        }

        return $slides->values();
    }
}
