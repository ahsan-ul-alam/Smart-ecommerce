<?php

use App\Jobs\ProcessAbandonedCarts;
use App\Jobs\ProcessLowStockAlerts;
use App\Jobs\RetryFailedPayment;
use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new ProcessAbandonedCarts)->hourly();
Schedule::job(new ProcessLowStockAlerts)->dailyAt('09:00');

Artisan::command('payments:retry-failed', function () {
    $orderIds = PaymentTransaction::query()
        ->whereIn('status', ['failed', 'cancelled', 'error'])
        ->where('created_at', '>=', now()->subDays(7))
        ->pluck('order_id')
        ->unique();

    foreach ($orderIds as $orderId) {
        RetryFailedPayment::dispatch($orderId);
    }

    $this->info("Queued {$orderIds->count()} payment retries.");
})->purpose('Retry failed online payments from the last 7 days');

Schedule::command('payments:retry-failed')->hourly();
