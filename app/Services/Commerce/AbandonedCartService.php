<?php

namespace App\Services\Commerce;

use App\Models\AbandonedCartReminder;
use App\Models\Cart;
use App\Services\Modules\ModuleService;
use App\Services\Notifications\NotificationService;
use App\Services\Settings\SettingService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AbandonedCartService
{
    public function __construct(
        protected ModuleService $modules,
        protected NotificationService $notifications,
        protected CartService $cartService,
        protected SettingService $settings,
    ) {}

    public function isEnabled(): bool
    {
        return $this->modules->isEnabled('abandoned_cart');
    }

    public function stats(int $idleHours = 2): array
    {
        $threshold = now()->subHours($idleHours);

        $abandonedQuery = Cart::query()
            ->whereHas('items')
            ->where('updated_at', '<', $threshold);

        $abandonedCount = (clone $abandonedQuery)->count();
        $remindersSent30d = AbandonedCartReminder::query()
            ->where('sent_at', '>=', now()->subDays(30))
            ->count();
        $cartsReminded = AbandonedCartReminder::query()
            ->where('sent_at', '>=', now()->subDays(30))
            ->distinct('cart_id')
            ->count('cart_id');

        $potentialRevenue = 0.0;
        foreach ((clone $abandonedQuery)->with('items')->limit(50)->get() as $cart) {
            $totals = $this->cartService->calculateTotals($cart);
            $potentialRevenue += (float) ($totals['total'] ?? 0);
        }

        return [
            'abandoned_carts' => $abandonedCount,
            'reminders_sent_30d' => $remindersSent30d,
            'carts_reminded_30d' => $cartsReminded,
            'potential_revenue' => round($potentialRevenue, 2),
            'recovery_coupon_default' => (string) $this->settings->get('notifications', 'abandoned_cart_recovery_coupon', ''),
        ];
    }

    public function list(int $idleHours = 2, int $perPage = 20): LengthAwarePaginator
    {
        $threshold = now()->subHours($idleHours);

        return Cart::query()
            ->whereHas('items')
            ->where('updated_at', '<', $threshold)
            ->with([
                'user:id,name,email,phone',
                'items.product:id,name,slug',
                'reminders' => fn ($q) => $q->latest()->limit(1),
            ])
            ->withCount('items')
            ->latest('updated_at')
            ->paginate($perPage)
            ->through(fn (Cart $cart) => $this->formatCart($cart));
    }

    public function sendReminder(Cart $cart, ?string $couponCode = null): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        $cart->load(['user', 'items']);

        if ($cart->items->isEmpty()) {
            return;
        }

        $phone = $cart->user?->phone;
        $email = $cart->user?->email;
        $url = url('/shop/cart');
        $coupon = $couponCode ?: (string) $this->settings->get('notifications', 'abandoned_cart_recovery_coupon', '');
        $coupon = $coupon !== '' ? $coupon : null;

        $this->notifications->abandonedCartReminder($phone, $email, $url, $coupon);

        AbandonedCartReminder::query()->create([
            'cart_id' => $cart->id,
            'channel' => $email ? 'email' : ($phone ? 'sms' : 'none'),
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    protected function formatCart(Cart $cart): array
    {
        $cart->loadMissing(['items.product', 'user', 'reminders']);

        $loaded = $this->cartService->calculateTotals($cart);

        $lastReminder = $cart->reminders->first();

        return [
            'id' => $cart->id,
            'customer' => $cart->user?->name ?? 'Guest',
            'email' => $cart->user?->email,
            'phone' => $cart->user?->phone,
            'items_count' => $cart->items_count,
            'subtotal' => $loaded['subtotal'] ?? 0,
            'total' => $loaded['total'] ?? 0,
            'updated_at' => $cart->updated_at?->toISOString(),
            'last_reminder_at' => $lastReminder?->sent_at?->toISOString(),
            'items' => $cart->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product?->name ?? 'Product',
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'line_total' => (float) $item->unit_price * $item->quantity,
            ])->values()->all(),
        ];
    }
}
