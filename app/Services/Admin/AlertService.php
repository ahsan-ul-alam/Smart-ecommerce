<?php

namespace App\Services\Admin;

use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\ReturnRequestStatus;
use App\Models\ContactInquiry;
use App\Models\Order;
use App\Models\OrderReturnRequest;
use App\Models\ProductReview;
use App\Repositories\ProductRepository;
use App\Services\Commerce\OrderService;

class AlertService
{
    public function __construct(
        protected OrderService $orders,
        protected ProductRepository $products,
    ) {}

    public function count(): int
    {
        return collect($this->build())->sum('count');
    }

    public function build(): array
    {
        $orderStats = $this->orders->getStats();
        $pendingOrders = (int) $orderStats['pending_orders'];
        $pendingReviews = ProductReview::query()->where('is_approved', false)->count();
        $newContacts = ContactInquiry::query()->where('status', 'new')->count();
        $pendingReturns = OrderReturnRequest::query()
            ->where('status', ReturnRequestStatus::Pending)
            ->count();
        $lowStock = $this->products->countLowStock();
        $failedDeliveries = Order::query()
            ->whereIn('status', [OrderStatus::Cancelled->value, OrderStatus::Returned->value])
            ->where('updated_at', '>=', now()->subDays(30))
            ->count();

        $alerts = [];

        if ($pendingOrders > 0) {
            $alerts[] = [
                'id' => 'pending_orders',
                'type' => 'orders',
                'title' => 'Pending orders',
                'description' => "{$pendingOrders} order(s) awaiting confirmation or processing.",
                'count' => $pendingOrders,
                'href' => '/admin/orders?status=pending',
                'priority' => 'high',
            ];
        }

        if ($pendingReturns > 0) {
            $alerts[] = [
                'id' => 'pending_returns',
                'type' => 'returns',
                'title' => 'Return requests',
                'description' => "{$pendingReturns} return request(s) need review.",
                'count' => $pendingReturns,
                'href' => '/admin/return-requests',
                'priority' => 'high',
            ];
        }

        if ($pendingReviews > 0) {
            $alerts[] = [
                'id' => 'pending_reviews',
                'type' => 'reviews',
                'title' => 'Reviews to moderate',
                'description' => "{$pendingReviews} review(s) waiting for approval.",
                'count' => $pendingReviews,
                'href' => '/admin/reviews',
                'priority' => 'medium',
            ];
        }

        if ($newContacts > 0) {
            $alerts[] = [
                'id' => 'contact_messages',
                'type' => 'contact',
                'title' => 'Contact inquiries',
                'description' => "{$newContacts} new message(s) from the contact form.",
                'count' => $newContacts,
                'href' => '/admin/contact-inquiries',
                'priority' => 'medium',
            ];
        }

        if ($lowStock > 0) {
            $alerts[] = [
                'id' => 'low_stock',
                'type' => 'inventory',
                'title' => 'Low stock',
                'description' => "{$lowStock} product(s) below stock threshold.",
                'count' => $lowStock,
                'href' => '/admin/inventory',
                'priority' => 'medium',
            ];
        }

        if ($failedDeliveries > 0) {
            $alerts[] = [
                'id' => 'failed_deliveries',
                'type' => 'delivery',
                'title' => 'Cancelled / returned (30d)',
                'description' => "{$failedDeliveries} order(s) cancelled or returned in the last 30 days.",
                'count' => $failedDeliveries,
                'href' => '/admin/reports?period=30',
                'priority' => 'low',
            ];
        }

        return $alerts;
    }
}
