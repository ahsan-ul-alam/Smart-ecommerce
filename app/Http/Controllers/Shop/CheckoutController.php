<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\CheckoutRequest;
use App\Services\Commerce\CartService;
use App\Services\Commerce\OrderService;
use App\Services\Commerce\PaymentService;
use App\Services\Customer\LoyaltyService;
use App\Services\Customer\WalletService;
use App\Services\Modules\ModuleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as IlluminateResponse;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected CartService $cartService,
        protected OrderService $orderService,
        protected PaymentService $paymentService,
        protected LoyaltyService $loyalty,
        protected WalletService $wallet,
        protected ModuleService $modules,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->cartService->resolve($request)->load(['items.product', 'coupon']);
        $formatted = $this->cartService->formatForFrontend($cart);

        if (empty($formatted['items'])) {
            return redirect()->route('shop.cart')->with('error', 'Your cart is empty.');
        }

        $rewards = $this->rewardsContext($request, $cart);

        $districts = \App\Models\ShippingZone::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->flatMap(fn ($z) => $z->districts ?? [])
            ->unique()
            ->sort()
            ->values()
            ->map(fn ($d) => ['value' => $d, 'label' => $d])
            ->all();

        if (empty($districts)) {
            $districts = collect(['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet'])
                ->map(fn ($d) => ['value' => $d, 'label' => $d])->all();
        }

        return Inertia::render('Shop/Checkout', [
            'cart' => $formatted,
            'rewards' => $rewards,
            'districts' => $districts,
            'paymentMethods' => $this->paymentService->enabledPaymentMethods(),
            'user' => $request->user() ? [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone,
            ] : null,
            'addresses' => $request->user()
                ? $request->user()->addresses()->orderByDesc('is_default')->get()
                : [],
        ]);
    }

    public function shippingPreview(Request $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate(['district' => ['required', 'string', 'max:100']]);
        $cart = $this->cartService->resolve($request)->load(['items.product', 'coupon']);

        $user = $request->user();
        $totals = $user
            ? $this->cartService->calculateTotalsWithRewards($cart, $user, 0, 0, $data['district'])
            : $this->cartService->calculateTotals($cart, $data['district']);

        return response()->json([
            'shipping' => $totals['shipping'],
            'tax' => $totals['tax'],
            'tax_label' => $totals['tax_label'] ?? 'VAT',
            'total' => $totals['total'],
            'shipping_zone' => $totals['shipping_zone'] ?? null,
            'free_shipping_min' => $totals['free_shipping_min'] ?? null,
        ]);
    }

    public function store(CheckoutRequest $request): RedirectResponse|IlluminateResponse
    {
        $cart = $this->cartService->resolve($request);

        $shippingAddress = [
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address_line_1' => $request->address_line_1,
            'address_line_2' => $request->address_line_2,
            'city' => $request->city,
            'district' => $request->district,
            'postal_code' => $request->postal_code,
            'country' => 'Bangladesh',
        ];

        $isOnline = $this->paymentService->isOnlinePayment($request->payment_method);

        [$loyaltyPoints, $walletAmount] = $this->resolveRewardUsage($request, $cart);

        $order = $this->orderService->createFromCart($cart, [
            'user_id' => $request->user()?->id,
            'guest_name' => $request->user() ? null : $request->name,
            'guest_email' => $request->email,
            'guest_phone' => $request->phone,
            'shipping_address' => $shippingAddress,
            'customer_note' => $request->customer_note,
            'payment_method' => $request->payment_method,
            'loyalty_points' => $loyaltyPoints,
            'wallet_amount' => $walletAmount,
        ], deductStock: ! $isOnline);

        if ($isOnline) {
            $payment = $this->paymentService->initiate($order);

            if (! empty($payment['redirect_url'])) {
                return $this->redirectToPaymentGateway($request, $payment['redirect_url']);
            }

            return redirect()
                ->route('shop.orders.confirmation', $order->order_number)
                ->with('error', $payment['message'] ?? 'Could not initiate payment. Check payment gateway credentials in Admin → Integrations.');
        }

        return redirect()
            ->route('shop.orders.confirmation', $order->order_number)
            ->with('success', 'Order placed successfully!');
    }

    public function confirmation(string $orderNumber): Response
    {
        $order = \App\Models\Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        return Inertia::render('Shop/OrderConfirmation', [
            'order' => (new \App\Http\Resources\OrderResource($order))->resolve(),
        ]);
    }

    protected function rewardsContext(Request $request, $cart): array
    {
        $user = $request->user();
        if (! $user) {
            return ['loyalty_enabled' => false, 'wallet_enabled' => false];
        }

        $loyaltyAccount = $this->loyalty->isEnabled() ? $this->loyalty->account($user) : null;
        $wallet = $this->wallet->isEnabled() ? $this->wallet->wallet($user) : null;
        $baseTotals = $this->cartService->calculateTotals($cart);
        $afterCoupon = max(0, $baseTotals['subtotal'] - $baseTotals['discount'] + $baseTotals['shipping']);

        return [
            'loyalty_enabled' => $this->loyalty->isEnabled(),
            'wallet_enabled' => $this->wallet->isEnabled(),
            'points_balance' => $loyaltyAccount?->points ?? 0,
            'wallet_balance' => (float) ($wallet?->balance ?? 0),
            'point_value' => $this->loyalty->pointValue(),
            'min_redeem_points' => $this->loyalty->minRedeemPoints(),
            'max_loyalty_discount' => $this->loyalty->isEnabled() && $loyaltyAccount
                ? $this->loyalty->previewRedemption($user, $loyaltyAccount->points, $afterCoupon)['discount']
                : 0,
            'max_wallet_use' => $this->wallet->isEnabled()
                ? $this->wallet->previewUsage($user, (float) $wallet->balance, $afterCoupon)
                : 0,
        ];
    }

    /**
     * Inertia XHR cannot follow redirect()->away(); use Inertia::location() for external gateways.
     */
    protected function redirectToPaymentGateway(Request $request, string $url): RedirectResponse|IlluminateResponse
    {
        if ($request->header('X-Inertia')) {
            return Inertia::location($url);
        }

        return redirect()->away($url);
    }

    protected function resolveRewardUsage(Request $request, $cart): array
    {
        $user = $request->user();
        if (! $user) {
            return [0, 0.0];
        }

        $loyaltyAccount = $this->loyalty->account($user);
        $wallet = $this->wallet->wallet($user);
        $baseTotals = $this->cartService->calculateTotals($cart);
        $afterCoupon = max(0, $baseTotals['subtotal'] - $baseTotals['discount'] + $baseTotals['shipping']);

        $loyaltyPoints = $request->boolean('use_max_loyalty')
            ? $loyaltyAccount->points
            : (int) $request->input('loyalty_points', 0);

        $preview = $this->loyalty->previewRedemption($user, $loyaltyPoints, $afterCoupon);
        $afterLoyalty = max(0, $afterCoupon - $preview['discount']);

        $walletAmount = $request->boolean('use_max_wallet')
            ? (float) $wallet->balance
            : (float) $request->input('wallet_amount', 0);

        $walletAmount = $this->wallet->previewUsage($user, $walletAmount, $afterLoyalty);

        return [$preview['points'], $walletAmount];
    }
}
