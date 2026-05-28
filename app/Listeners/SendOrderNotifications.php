<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Services\Notifications\NotificationService;

class SendOrderNotifications
{
    public function __construct(
        protected NotificationService $notifications,
    ) {}

    public function handle(OrderPlaced $event): void
    {
        $this->notifications->orderPlaced($event->order);
    }
}
