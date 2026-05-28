<?php

namespace App\Services\Admin;

use App\Domain\Enums\OrderStatus;
use App\Models\Cart;
use App\Models\ContactInquiry;
use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\OrderReturnRequest;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use App\Domain\Enums\ReturnRequestStatus;
use App\Repositories\ProductRepository;
use App\Services\Commerce\OrderService;
use App\Services\Modules\ModuleService;
use App\Services\Reports\ReportService;
use App\Support\MediaUrl;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DashboardService
{
    public function __construct(
        protected ProductRepository $products,
        protected OrderService $orders,
        protected ReportService $reports,
        protected ModuleService $modules,
        protected AlertService $alerts,
    ) {}

    public function build(Request $request): array
    {
        $period = $this->resolvePeriod($request);
        $user = $request->user();

        $daily = $this->reports->dailyChart($period);
        $periodOrders = (int) collect($daily)->sum('orders');
        $periodRevenue = round((float) collect($daily)->sum('revenue'), 2);

        $rangeStart = now()->subDays($period - 1)->startOfDay();
        $prevRangeStart = now()->subDays($period * 2 - 1)->startOfDay();
        $prevRangeEnd = now()->subDays($period)->endOfDay();

        $orderStats = $this->orders->getStats();

        return [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
            ],
            'period' => $period,
            'periods' => [
                ['value' => 7, 'label' => 'Last 7 days'],
                ['value' => 30, 'label' => 'Last 30 days'],
            ],
            'dateRange' => [
                'from' => $rangeStart->format('M j'),
                'to' => now()->format('M j, Y'),
            ],
            'stats' => [
                'orders_today' => $orderStats['orders_today'],
                'revenue_today' => round($orderStats['revenue_today'], 2),
                'orders_period' => $periodOrders,
                'revenue_period' => $periodRevenue,
                'revenue_month' => round($orderStats['revenue_month'], 2),
                'customers_total' => User::role('customer')->count(),
                'customers_new_period' => User::role('customer')
                    ->where('created_at', '>=', $rangeStart)
                    ->count(),
                'pending_orders' => $orderStats['pending_orders'],
                'total_orders' => $orderStats['total_orders'],
                'total_revenue' => round((float) $this->validOrdersQuery()->sum('total'), 2),
                'average_order_value' => $periodOrders > 0
                    ? round($periodRevenue / $periodOrders, 2)
                    : 0.0,
                'conversion_rate' => $this->conversionRate($rangeStart),
                'products_total' => $this->products->count(),
                'products_published' => $this->products->countPublished(),
                'low_stock_products' => $this->products->countLowStock(),
                'abandoned_carts' => Cart::query()->whereHas('items')->count(),
                'pending_returns' => OrderReturnRequest::query()
                    ->where('status', ReturnRequestStatus::Pending)
                    ->count(),
                'pending_reviews' => ProductReview::query()->where('is_approved', false)->count(),
                'new_contact_messages' => ContactInquiry::query()->where('status', 'new')->count(),
                'newsletter_subscribers' => NewsletterSubscriber::query()->active()->count(),
                'total_reviews' => ProductReview::query()->count(),
                'return_rate' => $this->returnRate(),
                'alert_count' => $this->alerts->count(),
            ],
            'trends' => [
                'orders' => $this->percentChange(
                    $this->countOrdersBetween($prevRangeStart, $prevRangeEnd),
                    $this->countOrdersSince($rangeStart)
                ),
                'revenue' => $this->percentChange(
                    $this->sumRevenueBetween($prevRangeStart, $prevRangeEnd),
                    $periodRevenue
                ),
                'customers' => $this->percentChange(
                    User::role('customer')->whereBetween('created_at', [$prevRangeStart, $prevRangeEnd])->count(),
                    User::role('customer')->where('created_at', '>=', $rangeStart)->count()
                ),
                'pending_orders' => $this->percentChange(
                    Order::query()->where('status', OrderStatus::Pending)
                        ->whereBetween('created_at', [$prevRangeStart, $prevRangeEnd])
                        ->count(),
                    Order::query()->where('status', OrderStatus::Pending)
                        ->where('created_at', '>=', $rangeStart)
                        ->count()
                ),
            ],
            'sparklines' => [
                'orders' => $daily,
                'revenue' => $daily,
            ],
            'daily' => $daily,
            'ordersByStatus' => $this->reports->ordersByStatus($period),
            'topProducts' => $this->topProductsWithImages($period, 5),
            'recentOrders' => $this->reports->recentOrders(8),
            'quickActions' => $this->quickActions($user),
            'storeStats' => $this->filterStoreStats($this->storeStats(), $user),
        ];
    }

    protected function resolvePeriod(Request $request): int
    {
        $period = (int) $request->input('period', 7);

        return in_array($period, [7, 30], true) ? $period : 7;
    }

    protected function validOrdersQuery(): Builder
    {
        return Order::query()->whereNotIn('status', [
            OrderStatus::Cancelled->value,
            OrderStatus::Refunded->value,
        ]);
    }

    protected function countOrdersSince(Carbon $from): int
    {
        return $this->validOrdersQuery()->where('created_at', '>=', $from)->count();
    }

    protected function countOrdersBetween(Carbon $from, Carbon $to): int
    {
        return $this->validOrdersQuery()->whereBetween('created_at', [$from, $to])->count();
    }

    protected function sumRevenueBetween(Carbon $from, Carbon $to): float
    {
        return (float) $this->validOrdersQuery()->whereBetween('created_at', [$from, $to])->sum('total');
    }

    protected function percentChange(float $previous, float $current): float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    protected function conversionRate(Carbon $since): float
    {
        $customersTotal = User::role('customer')->count();
        if ($customersTotal === 0) {
            return 0.0;
        }

        $orderingCustomers = $this->validOrdersQuery()
            ->where('created_at', '>=', $since)
            ->whereNotNull('user_id')
            ->distinct()
            ->count('user_id');

        return round(($orderingCustomers / $customersTotal) * 100, 1);
    }

    protected function returnRate(): float
    {
        $total = Order::query()->count();
        if ($total === 0) {
            return 0.0;
        }

        return round((OrderReturnRequest::query()->count() / $total) * 100, 1);
    }

    protected function topProductsWithImages(int $days, int $limit): array
    {
        $items = $this->reports->topProducts($days, $limit);
        if ($items === []) {
            return [];
        }

        $productIds = collect($items)->pluck('product_id')->filter()->all();
        $products = Product::query()
            ->with(['images' => fn ($q) => $q->orderByDesc('is_primary')])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        return collect($items)->map(function (array $item) use ($products) {
            $product = $products->get($item['product_id']);
            $image = $product?->primaryImage();

            return [
                ...$item,
                'image' => $image ? MediaUrl::resolve($image->path) : null,
                'slug' => $product?->slug,
            ];
        })->values()->all();
    }

    protected function storeStats(): array
    {
        return [
            [
                'label' => 'Products',
                'value' => $this->products->count(),
                'href' => '/admin/products',
                'icon' => 'package',
                'permission' => 'products.manage',
            ],
            [
                'label' => 'Reviews',
                'value' => ProductReview::query()->count(),
                'href' => '/admin/reviews',
                'icon' => 'star',
                'permission' => 'products.manage',
            ],
            [
                'label' => 'Low Stock',
                'value' => $this->products->countLowStock(),
                'href' => '/admin/inventory',
                'icon' => 'alert',
                'permission' => 'products.manage',
            ],
            [
                'label' => 'Abandoned Carts',
                'value' => Cart::query()->whereHas('items')->count(),
                'href' => '/admin/abandoned-carts',
                'icon' => 'cart',
                'permission' => 'orders.manage',
                'module' => 'abandoned_cart',
            ],
            [
                'label' => 'Newsletter',
                'value' => NewsletterSubscriber::query()->active()->count(),
                'href' => '/admin/newsletter',
                'icon' => 'mail',
                'permission' => 'customers.manage',
            ],
            [
                'label' => 'Return Rate',
                'value' => $this->returnRate().'%',
                'href' => '/admin/return-requests',
                'icon' => 'return',
                'permission' => 'orders.manage',
            ],
        ];
    }

    protected function filterStoreStats(array $stats, $user): array
    {
        $enabledModules = $this->modules->enabledKeys();
        $can = fn (string $permission) => $user->hasRole('super_admin') || $user->can($permission);

        return collect($stats)
            ->filter(function (array $stat) use ($can, $enabledModules) {
                if (isset($stat['permission']) && ! $can($stat['permission'])) {
                    return false;
                }
                if (isset($stat['module']) && ! in_array($stat['module'], $enabledModules, true)) {
                    return false;
                }

                return true;
            })
            ->map(fn (array $stat) => [
                'label' => $stat['label'],
                'value' => $stat['value'],
                'href' => $stat['href'],
                'icon' => $stat['icon'],
            ])
            ->values()
            ->all();
    }

    protected function quickActions($user): array
    {
        $enabledModules = $this->modules->enabledKeys();
        $actions = [];

        $can = fn (string $permission) => $user->hasRole('super_admin') || $user->can($permission);

        if ($can('products.manage')) {
            $actions[] = ['href' => '/admin/products/create', 'label' => 'Add Product', 'icon' => 'plus', 'color' => 'indigo'];
        }
        if ($can('orders.manage')) {
            $actions[] = ['href' => '/admin/orders', 'label' => 'Orders', 'icon' => 'cart', 'color' => 'sky'];
        }
        if ($can('orders.manage') && in_array('pos', $enabledModules, true)) {
            $actions[] = ['href' => '/admin/pos', 'label' => 'POS', 'icon' => 'store', 'color' => 'violet'];
        }
        if ($can('coupons.manage')) {
            $actions[] = ['href' => '/admin/coupons', 'label' => 'Coupons', 'icon' => 'tag', 'color' => 'amber'];
        }
        if ($can('reports.view') && in_array('analytics', $enabledModules, true)) {
            $actions[] = ['href' => '/admin/reports', 'label' => 'Reports', 'icon' => 'chart', 'color' => 'emerald'];
        }
        if ($can('customers.manage')) {
            $actions[] = ['href' => '/admin/customers', 'label' => 'Customers', 'icon' => 'users', 'color' => 'rose'];
        }

        return $actions;
    }
}
