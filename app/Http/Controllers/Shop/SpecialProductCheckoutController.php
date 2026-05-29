<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\SpecialProductCheckoutRequest;
use App\Models\SpecialProduct;
use App\Services\Commerce\PaymentService;
use App\Services\Commerce\SpecialProductOrderService;
use App\Services\Geo\BangladeshLocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as IlluminateResponse;
use Inertia\Inertia;
use Inertia\Response;

class SpecialProductCheckoutController extends Controller
{
    public function __construct(
        protected SpecialProductOrderService $offerOrders,
        protected PaymentService $payments,
        protected BangladeshLocationService $locations,
    ) {}

    public function shippingPreview(Request $request, string $slug): JsonResponse
    {
        $page = $this->resolvePage($slug);
        $product = $page->product;

        $data = $request->validate([
            'district' => ['required', 'string', 'max:100'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:20'],
            'variant_id' => ['nullable', 'integer'],
        ]);

        $variant = $this->resolveVariantForPreview($product, $data['variant_id'] ?? null);
        $district = $this->locations->normalizeDistrictForShipping($data['district']);

        return response()->json(
            $this->offerOrders->previewTotals(
                $product,
                $variant,
                (int) ($data['quantity'] ?? 1),
                $district,
            )
        );
    }

    public function store(SpecialProductCheckoutRequest $request, string $slug): RedirectResponse|IlluminateResponse
    {
        $page = $this->resolvePage($slug);
        $product = $page->product;

        $shippingAddress = $this->locations->toShippingPayload($request->only([
            'name', 'phone', 'email', 'division', 'district', 'thana', 'local_address', 'postal_code',
        ]));

        $isOnline = $this->payments->isOnlinePayment($request->payment_method);

        $order = $this->offerOrders->createOrder($page, [
            'user_id' => $request->user()?->id,
            'guest_name' => $request->user() ? null : $request->name,
            'guest_email' => $request->email,
            'guest_phone' => $request->phone,
            'shipping_address' => $shippingAddress,
            'customer_note' => $request->customer_note,
            'payment_method' => $request->payment_method,
            'quantity' => $request->quantity,
            'variant_id' => $request->variant_id,
        ], deductStock: ! $isOnline);

        $request->session()->put('offer_checkout_return', [
            'slug' => $page->slug,
            'order_number' => $order->order_number,
        ]);

        if ($isOnline) {
            $payment = $this->payments->initiate($order);

            if (! empty($payment['redirect_url'])) {
                return $this->redirectToGateway($request, $payment['redirect_url']);
            }

            return redirect()->route('offer.order.result', [
                'slug' => $page->slug,
                'orderNumber' => $order->order_number,
                'status' => 'failed',
            ])->with('error', $payment['message'] ?? 'Could not initiate payment.');
        }

        return redirect()->route('offer.order.result', [
            'slug' => $page->slug,
            'orderNumber' => $order->order_number,
            'status' => 'success',
        ])->with('success', 'Order placed successfully!');
    }

    public function result(Request $request, string $slug, string $orderNumber, string $status): Response
    {
        $page = SpecialProduct::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $order = \App\Models\Order::query()
            ->where('order_number', $orderNumber)
            ->where('special_product_id', $page->id)
            ->with('items')
            ->firstOrFail();

        $success = $status === 'success' && ! $request->session()->has('error');

        if ($order->payment_method !== \App\Domain\Enums\PaymentMethod::Cod
            && $order->payment_status !== \App\Domain\Enums\PaymentStatus::Paid) {
            $success = false;
        }

        return Inertia::render('Shop/OfferOrderResult', [
            'page' => ['name' => $page->name, 'slug' => $page->slug, 'theme' => $page->theme ?? []],
            'success' => $success,
            'order' => (new \App\Http\Resources\OrderResource($order))->resolve(),
        ]);
    }

    protected function resolvePage(string $slug): SpecialProduct
    {
        return SpecialProduct::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with(['product.variants', 'product.images'])
            ->firstOrFail();
    }

    protected function resolveVariantForPreview($product, ?int $variantId)
    {
        $product->loadMissing('variants');
        $active = $product->variants->where('is_active', true);

        if ($active->isEmpty()) {
            return null;
        }

        return $variantId ? $active->firstWhere('id', $variantId) : $active->first();
    }

    protected function redirectToGateway(Request $request, string $url): RedirectResponse|IlluminateResponse
    {
        if ($request->header('X-Inertia')) {
            return Inertia::location($url);
        }

        return redirect()->away($url);
    }
}
