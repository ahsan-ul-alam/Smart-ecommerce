<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\Notifications\NotificationService;
use App\Services\Settings\SettingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class ProcessLowStockAlerts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NotificationService $notifications, SettingService $settings): void
    {
        if (! $settings->getBoolean('notifications', 'low_stock_alert', true)) {
            return;
        }

        if (Cache::has('arcommerze.low_stock_alert_sent')) {
            return;
        }

        $products = Product::query()
            ->where('track_inventory', true)
            ->lowStock()
            ->orderBy('stock_quantity')
            ->limit(20)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold']);

        if ($products->isEmpty()) {
            return;
        }

        $notifications->lowStockAlert($products);

        Cache::put('arcommerze.low_stock_alert_sent', true, now()->addHours(24));
    }
}
