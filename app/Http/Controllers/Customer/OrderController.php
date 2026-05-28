<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Commerce\ReturnRequestService;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected SettingService $settings,
        protected ReturnRequestService $returns,
    ) {}

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->withCount('items')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customer/Orders/Index', [
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load(['items', 'statusHistories', 'returnRequest', 'shipment']);

        return Inertia::render('Customer/Orders/Show', [
            'order' => (new OrderResource($order))->resolve(),
            'returnReasons' => [
                'defective' => 'Product defective or damaged',
                'wrong_item' => 'Wrong item received',
                'not_as_described' => 'Not as described',
                'changed_mind' => 'Changed my mind',
                'other' => 'Other',
            ],
        ]);
    }

    public function requestReturn(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:100'],
            'customer_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->returns->submit($order, $request->user(), $data['reason'], $data['customer_note'] ?? null);

        return back()->with('success', 'Return request submitted. We will review it shortly.');
    }

    public function invoice(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load(['items']);

        $branding = $this->settings->branding();

        return Inertia::render('Admin/Orders/Invoice', [
            'order' => (new OrderResource($order))->resolve(),
            'store' => [
                'name' => $branding['site_name'],
                'phone' => $branding['store_phone'],
                'address' => $branding['store_address'],
                'email' => $branding['store_email'],
                'logo' => $branding['logo'],
            ],
            'backUrl' => "/account/orders/{$order->id}",
        ]);
    }
}
