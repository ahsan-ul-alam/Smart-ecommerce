<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Commerce\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->resolve($request);
        $cart->load(['items.product', 'coupon']);

        return response()->json([
            'cart' => $this->cartService->formatForFrontend($cart),
        ]);
    }

    public function storeItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);

        $cart = $this->cartService->resolve($request);
        $this->cartService->addItem($cart, $data['product_id'], $data['quantity'], $data['variant_id'] ?? null);

        return $this->show($request);
    }
}
