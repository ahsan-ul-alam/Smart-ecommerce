<?php

namespace App\Services\Marketing;

use App\Models\Referral;
use App\Models\User;
use App\Services\Customer\LoyaltyService;
use App\Services\Customer\WalletService;
use App\Services\Modules\ModuleService;
use App\Services\Settings\SettingService;
use Illuminate\Support\Str;

class ReferralService
{
    public function __construct(
        protected ModuleService $modules,
        protected SettingService $settings,
        protected WalletService $wallet,
        protected LoyaltyService $loyalty,
    ) {}

    public function isEnabled(): bool
    {
        return $this->modules->isEnabled('referral');
    }

    public function ensureCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }

        do {
            $code = Str::upper(Str::random(8));
        } while (User::query()->where('referral_code', $code)->exists());

        $user->update(['referral_code' => $code]);

        return $code;
    }

    public function applyOnRegister(User $newUser, ?string $code): void
    {
        if (! $this->isEnabled() || ! $code) {
            return;
        }

        $referrer = User::query()
            ->where('referral_code', strtoupper(trim($code)))
            ->where('id', '!=', $newUser->id)
            ->first();

        if (! $referrer) {
            return;
        }

        $newUser->update(['referred_by_user_id' => $referrer->id]);

        Referral::query()->firstOrCreate(
            ['referred_id' => $newUser->id],
            [
                'referrer_id' => $referrer->id,
                'status' => 'pending',
                'reward_amount' => (float) $this->settings->get('commerce', 'referral_reward_amount', 50),
                'reward_type' => $this->settings->get('commerce', 'referral_reward_type', 'wallet'),
            ]
        );
    }

    public function rewardOnFirstOrder(\App\Models\Order $order): void
    {
        if (! $this->isEnabled() || ! $order->user_id) {
            return;
        }

        $referral = Referral::query()
            ->where('referred_id', $order->user_id)
            ->where('status', 'pending')
            ->first();

        if (! $referral) {
            return;
        }

        $priorOrders = \App\Models\Order::query()
            ->where('user_id', $order->user_id)
            ->where('id', '!=', $order->id)
            ->where('payment_status', \App\Domain\Enums\PaymentStatus::Paid)
            ->exists();

        if ($priorOrders) {
            return;
        }

        $referrer = User::query()->find($referral->referrer_id);
        if (! $referrer) {
            return;
        }

        $amount = (float) $referral->reward_amount;

        if ($referral->reward_type === 'loyalty' && $this->loyalty->isEnabled()) {
            $this->loyalty->adjust($referrer, (int) $amount, "Referral reward for {$order->customerName()}");
        } elseif ($this->wallet->isEnabled()) {
            $this->wallet->credit($referrer, $amount, "Referral reward — order {$order->order_number}", $order);
        }

        $referral->update([
            'status' => 'rewarded',
            'order_id' => $order->id,
            'rewarded_at' => now(),
        ]);
    }
}
