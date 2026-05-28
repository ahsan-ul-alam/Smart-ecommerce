<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\FlashSale;
use App\Services\Marketing\FlashSaleService;
use App\Support\MediaUrl;
use Inertia\Inertia;
use Inertia\Response;

class FlashSaleController extends Controller
{
    public function __construct(
        protected FlashSaleService $flashSales,
    ) {}

    public function index(): Response
    {
        $sales = $this->flashSales->activeSales();

        $productIds = $sales->flatMap(fn ($s) => $s->products->pluck('id'))->unique()->all();
        $this->flashSales->hydrateCache($productIds);

        return Inertia::render('Shop/FlashSales/Index', [
            'sales' => $sales->map(fn ($sale) => [
                'id' => $sale->id,
                'title' => $sale->title,
                'slug' => $sale->slug,
                'description' => $sale->description,
                'image' => MediaUrl::resolve($sale->image),
                'ends_at' => $sale->ends_at->toISOString(),
                'products' => ProductResource::collection($sale->products)->resolve(),
            ]),
        ]);
    }

    public function show(string $slug): Response
    {
        $sale = FlashSale::query()->active()->where('slug', $slug)->firstOrFail();
        $sale->load(['products' => fn ($q) => $q->published()->with(['category:id,name', 'brand:id,name', 'images'])]);

        $this->flashSales->hydrateCache($sale->products->pluck('id')->all());

        return Inertia::render('Shop/FlashSales/Show', [
            'sale' => [
                'id' => $sale->id,
                'title' => $sale->title,
                'slug' => $sale->slug,
                'description' => $sale->description,
                'image' => MediaUrl::resolve($sale->image),
                'ends_at' => $sale->ends_at->toISOString(),
            ],
            'products' => ProductResource::collection($sale->products)->resolve(),
        ]);
    }
}
