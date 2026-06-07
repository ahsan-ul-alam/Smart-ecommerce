<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Services\Commerce\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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

    public function drawer(Request $request): \Illuminate\Http\JsonResponse
    {
        $cart = $this->cartService->resolve($request);

        return response()->json([
            'cart' => $this->cartService->formatForFrontend($cart->load(['items.product', 'coupon'])),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['integer', 'min:1', 'max:99'],
            'buy_now' => ['sometimes', 'boolean'],
        ]);

        $cart = $this->cartService->resolve($request);
        $this->cartService->addItem(
            $cart,
            $request->integer('product_id'),
            $request->integer('quantity', 1),
            $request->input('variant_id') ? $request->integer('variant_id') : null,
        );

        $message = 'Added to cart.';

        if ($request->boolean('buy_now')) {
            return redirect()->route('shop.checkout')->with('success', $message);
        }

        return back()->with('success', $message);
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

    public function applyCoupon(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'district' => ['nullable', 'string', 'max:100'],
        ], [
            'code.required' => 'Please enter a coupon code.',
            'code.max' => 'Coupon code is too long.',
        ]);

        try {
            $cart = $this->cartService->resolve($request)->load('items');
            $cart = $this->cartService->applyCoupon($cart, $request->input('code'));
            $formatted = $this->formatCartForResponse($request, $cart);
            $discount = $formatted['totals']['coupon_discount'] ?? 0;

            $message = $discount > 0
                ? sprintf('Coupon applied! You save ৳%s.', number_format($discount, 0))
                : 'Coupon applied successfully.';

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $message,
                    'cart' => $formatted,
                ]);
            }

            return back()->with('success', $message);
        } catch (ValidationException $e) {
            $error = collect($e->errors())->flatten()->first() ?? 'Could not apply coupon.';

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $error,
                    'errors' => $e->errors(),
                ], 422);
            }

            return back()
                ->withErrors($e->errors())
                ->with('error', $error);
        }
    }

    public function removeCoupon(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'district' => ['nullable', 'string', 'max:100'],
        ]);

        $cart = $this->cartService->resolve($request);

        if (! $cart->coupon_id) {
            $error = 'No coupon is applied to your cart.';

            if ($request->expectsJson()) {
                return response()->json(['message' => $error], 422);
            }

            return back()->with('error', $error);
        }

        $cart = $this->cartService->removeCoupon($cart);
        $formatted = $this->formatCartForResponse($request, $cart);
        $message = 'Coupon removed.';

        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'cart' => $formatted,
            ]);
        }

        return back()->with('success', $message);
    }

    protected function formatCartForResponse(Request $request, Cart $cart): array
    {
        $cart->load(['items.product', 'coupon']);
        $formatted = $this->cartService->formatForFrontend($cart);

        if ($district = $request->input('district')) {
            $formatted['totals'] = $this->cartService->calculateTotals($cart, $district);
        }

        return $formatted;
    }
}
