<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Vendor;
use App\Services\Marketing\FlashSaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function __construct(
        protected FlashSaleService $flashSales,
    ) {}

    public function show(Request $request, string $slug): Response
    {
        $vendor = Vendor::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $products = Product::query()
            ->published()
            ->where('vendor_id', $vendor->id)
            ->with(['category:id,name', 'brand:id,name', 'images'])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $this->flashSales->hydrateCache($products->pluck('id')->all());

        return Inertia::render('Shop/Vendors/Show', [
            'vendor' => $vendor->only(['id', 'name', 'slug', 'email', 'phone', 'logo']),
            'products' => ProductResource::collection($products),
            'filters' => $request->only(['search']),
        ]);
    }
}
