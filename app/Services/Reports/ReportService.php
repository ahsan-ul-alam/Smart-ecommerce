<?php

namespace App\Services\Reports;

use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentMethod;
use App\Domain\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function getReport(int $days = 30): array
    {
        return [
            'period' => $days,
            'summary' => $this->summary($days),
            'daily' => $this->dailyChart($days),
            'orders_by_status' => $this->ordersByStatus($days),
            'payment_methods' => $this->paymentMethods($days),
            'top_products' => $this->topProducts($days),
            'sales_by_source' => $this->salesBySource($days),
        ];
    }

    public function salesBySource(int $days): array
    {
        return $this->orderQuery($days)
            ->selectRaw('source, COUNT(*) as orders, SUM(total) as revenue')
            ->groupBy('source')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'source' => $row->source ?: 'web',
                'label' => ($row->source === 'pos') ? 'POS (In-store)' : 'Online',
                'orders' => (int) $row->orders,
                'revenue' => round((float) $row->revenue, 2),
            ])
            ->values()
            ->all();
    }

    public function summary(int $days): array
    {
        $query = $this->orderQuery($days);
        $paidQuery = (clone $query)->where('payment_status', PaymentStatus::Paid);

        $orders = (clone $query)->count();
        $revenue = (float) (clone $query)->sum('total');
        $paidRevenue = (float) $paidQuery->sum('total');

        return [
            'orders' => $orders,
            'revenue' => round($revenue, 2),
            'paid_revenue' => round($paidRevenue, 2),
            'avg_order_value' => $orders > 0 ? round($revenue / $orders, 2) : 0,
            'customers' => User::role('customer')->count(),
            'conversion_note' => 'Revenue excludes cancelled & refunded orders',
        ];
    }

    public function dailyChart(int $days): array
    {
        if ($days <= 0) {
            $days = 30;
        }

        $start = now()->subDays($days - 1)->startOfDay();
        $driver = DB::connection()->getDriverName();
        $dateExpr = $driver === 'sqlite'
            ? "date(created_at)"
            : 'DATE(created_at)';

        $rows = $this->orderQuery($days)
            ->selectRaw("{$dateExpr} as day, COUNT(*) as orders, SUM(total) as revenue")
            ->where('created_at', '>=', $start)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $period = CarbonPeriod::create($start->toDateString(), now()->toDateString());
        $chart = [];

        foreach ($period as $date) {
            $day = $date->format('Y-m-d');
            $row = $rows->get($day);
            $chart[] = [
                'date' => $day,
                'label' => $date->format('M j'),
                'orders' => (int) ($row->orders ?? 0),
                'revenue' => round((float) ($row->revenue ?? 0), 2),
            ];
        }

        return $chart;
    }

    public function ordersByStatus(int $days): array
    {
        return $this->orderQuery($days)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'status' => $this->enumValue($row->status),
                'label' => $this->orderStatusLabel($row->status),
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();
    }

    public function paymentMethods(int $days): array
    {
        return $this->orderQuery($days)
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as revenue')
            ->groupBy('payment_method')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'method' => $this->enumValue($row->payment_method),
                'label' => $this->paymentMethodLabel($row->payment_method),
                'count' => (int) $row->count,
                'revenue' => round((float) $row->revenue, 2),
            ])
            ->values()
            ->all();
    }

    public function topProducts(int $days, int $limit = 10): array
    {
        $orderIds = $this->orderQuery($days)->pluck('id');

        if ($orderIds->isEmpty()) {
            return [];
        }

        return OrderItem::query()
            ->whereIn('order_id', $orderIds)
            ->selectRaw('product_id, product_name, SUM(quantity) as quantity, SUM(total) as revenue')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('quantity')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'product_id' => $row->product_id,
                'name' => $row->product_name,
                'quantity' => (int) $row->quantity,
                'revenue' => round((float) $row->revenue, 2),
            ])
            ->values()
            ->all();
    }

    public function recentOrders(int $limit = 8): array
    {
        return Order::query()
            ->with('user:id,name,email')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customerName(),
                'status' => $order->status?->value,
                'status_label' => $order->status?->label(),
                'payment_status' => $order->payment_status?->value,
                'total' => (float) $order->total,
                'created_at' => $order->created_at?->toISOString(),
            ])
            ->all();
    }

    protected function enumValue(mixed $value): string
    {
        return $value instanceof \BackedEnum ? $value->value : (string) $value;
    }

    protected function orderStatusLabel(mixed $status): string
    {
        if ($status instanceof OrderStatus) {
            return $status->label();
        }

        return OrderStatus::tryFrom((string) $status)?->label() ?? (string) $status;
    }

    protected function paymentMethodLabel(mixed $method): string
    {
        if ($method instanceof PaymentMethod) {
            return $method->label();
        }

        return PaymentMethod::tryFrom((string) $method)?->label() ?? (string) $method;
    }

    protected function orderQuery(int $days): Builder
    {
        $query = Order::query()->whereNotIn('status', [
            OrderStatus::Cancelled->value,
            OrderStatus::Refunded->value,
        ]);

        if ($days > 0) {
            $query->where('created_at', '>=', now()->subDays($days)->startOfDay());
        }

        return $query;
    }
}
