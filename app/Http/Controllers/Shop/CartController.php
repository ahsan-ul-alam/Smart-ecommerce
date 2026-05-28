<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\Commerce\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService,
    ) {}

    public function index(Request $request): Response
    {
        $cart = $this->cartService->resolve($request);

        return Inertia::render('Shop/Cart', [
            'cart' => $this->cartService->formatForFrontend($cart->load(['items.product', 'coupon'])),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['integer', 'min:1', 'max:99'],
        ]);

        $cart = $this->cartService->resolve($request);
        $this->cartService->addItem(
            $cart,
            $request->integer('product_id'),
            $request->integer('quantity', 1),
            $request->input('variant_id') ? $request->integer('variant_id') : null,
        );

        return back()->with('success', 'Added to cart.');
    }

    public function update(Request $request, int $item): RedirectResponse
    {
        $request->validate(['quantity' => ['required', 'integer', 'min:0', 'max:99']]);

        $cart = $this->cartService->resolve($request);
        $this->cartService->updateQuantity($cart, $item, $request->integer('quantity'));

        return back();
    }

    public function destroy(Request $request, int $item): RedirectResponse
    {
        $cart = $this->cartService->resolve($request);
        $this->cartService->removeItem($cart, $item);

        return back();
    }

    public function applyCoupon(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $cart = $this->cartService->resolve($request);
        $this->cartService->applyCoupon($cart, $request->code);

        return back()->with('success', 'Coupon applied.');
    }

    public function removeCoupon(Request $request): RedirectResponse
    {
        $cart = $this->cartService->resolve($request);
        $this->cartService->removeCoupon($cart);

        return back();
    }
}
