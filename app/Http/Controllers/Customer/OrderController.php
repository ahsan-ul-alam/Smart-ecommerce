<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Settings\SettingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected SettingService $settings,
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

        $order->load(['items', 'statusHistories']);

        return Inertia::render('Customer/Orders/Show', [
            'order' => (new OrderResource($order))->resolve(),
        ]);
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
