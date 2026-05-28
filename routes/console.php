<?php

use App\Jobs\ProcessAbandonedCarts;
use App\Jobs\ProcessLowStockAlerts;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new ProcessAbandonedCarts)->hourly();
Schedule::job(new ProcessLowStockAlerts)->dailyAt('09:00');
