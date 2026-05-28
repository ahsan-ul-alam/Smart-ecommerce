<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use App\Repositories\ProductRepository;
use App\Services\Commerce\OrderService;
use App\Services\Reports\ReportService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ProductRepository $products,
        protected OrderService $orders,
        protected ReportService $reports,
    ) {}

    public function index(): Response
    {
        $orderStats = $this->orders->getStats();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'orders_today' => $orderStats['orders_today'],
                'revenue_today' => $orderStats['revenue_today'],
                'customers_total' => User::role('customer')->count(),
                'products_total' => $this->products->count(),
                'products_published' => $this->products->countPublished(),
                'pending_orders' => $orderStats['pending_orders'],
                'total_orders' => $orderStats['total_orders'],
                'low_stock_products' => $this->products->countLowStock(),
                'abandoned_carts' => Cart::query()->whereHas('items')->count(),
                'revenue_month' => (float) Order::query()
                    ->whereNotIn('status', ['cancelled', 'refunded'])
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->sum('total'),
            ],
            'recentOrders' => $this->reports->recentOrders(6),
        ]);
    }
}
