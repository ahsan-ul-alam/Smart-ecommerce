<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Customer\LoyaltyService;
use App\Services\Customer\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected LoyaltyService $loyalty,
        protected WalletService $wallet,
    ) {}

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->withCount('items')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Customer/Dashboard', [
            'recentOrders' => OrderResource::collection($orders)->resolve(),
            'stats' => [
                'total_orders' => Order::query()->where('user_id', $request->user()->id)->count(),
                'pending_orders' => Order::query()->where('user_id', $request->user()->id)->where('status', 'pending')->count(),
            ],
            'rewards' => [
                'loyalty_enabled' => $this->loyalty->isEnabled(),
                'wallet_enabled' => $this->wallet->isEnabled(),
                'points' => $this->loyalty->isEnabled() ? $this->loyalty->account($request->user())->points : 0,
                'wallet_balance' => $this->wallet->isEnabled() ? (float) $this->wallet->wallet($request->user())->balance : 0,
            ],
        ]);
    }
}
