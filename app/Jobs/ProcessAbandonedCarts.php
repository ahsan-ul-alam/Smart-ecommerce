<?php

namespace App\Jobs;

use App\Models\Cart;
use App\Services\Commerce\AbandonedCartService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessAbandonedCarts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(AbandonedCartService $abandonedCarts): void
    {
        if (! $abandonedCarts->isEnabled()) {
            return;
        }

        $threshold = now()->subHours(2);

        Cart::query()
            ->whereHas('items')
            ->where('updated_at', '<', $threshold)
            ->whereDoesntHave('reminders', fn ($q) => $q->where('created_at', '>', now()->subDay()))
            ->chunkById(50, function ($carts) use ($abandonedCarts) {
                foreach ($carts as $cart) {
                    $abandonedCarts->sendReminder($cart);
                }
            });
    }
}
