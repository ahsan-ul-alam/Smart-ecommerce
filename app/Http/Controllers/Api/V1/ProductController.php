<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->published()
            ->with(['images', 'category', 'brand'])
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->search.'%'))
            ->latest()
            ->paginate(min(50, (int) $request->get('per_page', 20)));

        return response()->json([
            'data' => ProductResource::collection($products->items())->resolve(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->published()
            ->where('slug', $slug)
            ->with(['images', 'variants', 'category', 'brand'])
            ->firstOrFail();

        return response()->json([
            'data' => (new ProductResource($product))->resolve(),
        ]);
    }
}
