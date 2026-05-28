<?php

namespace App\Services\Customer;

use App\Models\LoyaltyAccount;
use App\Models\Order;
use App\Models\User;
use App\Services\Modules\ModuleService;
use App\Services\Settings\SettingService;
use Illuminate\Validation\ValidationException;

class LoyaltyService
{
    public function __construct(
        protected ModuleService $modules,
        protected SettingService $settings,
    ) {}

    public function isEnabled(): bool
    {
        return $this->modules->isEnabled('loyalty');
    }

    public function account(User $user): LoyaltyAccount
    {
        return LoyaltyAccount::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['points' => 0]
        );
    }

    public function pointValue(): float
    {
        return (float) $this->settings->get('commerce', 'loyalty_point_value', 1);
    }

    public function minRedeemPoints(): int
    {
        return (int) $this->settings->get('commerce', 'loyalty_min_redeem', 100);
    }

    public function pointsPer100Taka(): int
    {
        return (int) $this->settings->get('commerce', 'loyalty_points_per_100', 10);
    }

    public function previewRedemption(User $user, int $pointsToUse, float $orderTotalBeforeLoyalty): array
    {
        if (! $this->isEnabled()) {
            return ['points' => 0, 'discount' => 0.0];
        }

        $account = $this->account($user);
        $pointsToUse = max(0, $pointsToUse);

        if ($pointsToUse > 0 && $pointsToUse < $this->minRedeemPoints()) {
            throw ValidationException::withMessages([
                'loyalty_points' => "Minimum {$this->minRedeemPoints()} points required to redeem.",
            ]);
        }

        $pointsToUse = min($pointsToUse, $account->points);
        $discount = round(min($pointsToUse * $this->pointValue(), $orderTotalBeforeLoyalty), 2);
        $pointsUsed = (int) floor($discount / $this->pointValue());

        return ['points' => $pointsUsed, 'discount' => $discount];
    }

    public function redeem(User $user, int $points, Order $order): void
    {
        if ($points <= 0) {
            return;
        }

        $account = $this->account($user);

        if ($account->points < $points) {
            throw ValidationException::withMessages(['loyalty_points' => 'Insufficient loyalty points.']);
        }

        $account->decrement('points', $points);

        $account->transactions()->create([
            'order_id' => $order->id,
            'type' => 'redeem',
            'points' => -$points,
            'balance_after' => $account->fresh()->points,
            'description' => "Redeemed on order #{$order->order_number}",
        ]);
    }

    public function earnForOrder(Order $order): int
    {
        if (! $this->isEnabled() || ! $order->user_id) {
            return 0;
        }

        $earnBase = max(0, (float) $order->total);
        $points = (int) floor($earnBase / 100) * $this->pointsPer100Taka();

        if ($points <= 0) {
            return 0;
        }

        $user = User::query()->find($order->user_id);
        $account = $this->account($user);
        $account->increment('points', $points);

        $account->transactions()->create([
            'order_id' => $order->id,
            'type' => 'earn',
            'points' => $points,
            'balance_after' => $account->fresh()->points,
            'description' => "Earned from order #{$order->order_number}",
        ]);

        $order->update(['loyalty_points_earned' => $points]);

        return $points;
    }

    public function adjust(User $user, int $points, string $description): LoyaltyAccount
    {
        $account = $this->account($user);
        $account->increment('points', $points);

        $account->transactions()->create([
            'type' => 'adjust',
            'points' => $points,
            'balance_after' => $account->fresh()->points,
            'description' => $description,
        ]);

        return $account->fresh();
    }
}
