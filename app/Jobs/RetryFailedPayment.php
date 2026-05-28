<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Commerce\PaymentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RetryFailedPayment implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $orderId,
    ) {}

    public function handle(PaymentService $payments): void
    {
        $order = Order::query()->find($this->orderId);
        if (! $order) {
            return;
        }

        $lastFailed = PaymentTransaction::query()
            ->where('order_id', $order->id)
            ->whereIn('status', ['failed', 'cancelled', 'error'])
            ->latest()
            ->first();

        if (! $lastFailed) {
            return;
        }

        $payments->initiate($order);
    }
}
