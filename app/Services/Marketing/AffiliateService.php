<?php

namespace App\Services\Marketing;

use App\Domain\Enums\PaymentStatus;
use App\Models\AffiliateCommission;
use App\Models\Order;
use App\Models\User;
use App\Services\Modules\ModuleService;
use App\Services\Settings\SettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AffiliateService
{
    public const SESSION_KEY = 'affiliate_code';

    public function __construct(
        protected ModuleService $modules,
        protected SettingService $settings,
    ) {}

    public function isEnabled(): bool
    {
        return $this->modules->isEnabled('affiliate');
    }

    public function captureFromRequest(Request $request): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        $code = strtoupper(trim((string) ($request->query('aff') ?? $request->query('affiliate'))));

        if ($code && $this->findAffiliate($code)) {
            $request->session()->put(self::SESSION_KEY, $code);
        }
    }

    public function commissionRate(): float
    {
        return (float) $this->settings->get('commerce', 'affiliate_commission_rate', 5);
    }

    public function ensureCode(User $user): ?string
    {
        if (! $user->is_affiliate) {
            return null;
        }

        if ($user->affiliate_code) {
            return $user->affiliate_code;
        }

        do {
            $code = 'AF'.Str::upper(Str::random(6));
        } while (User::query()->where('affiliate_code', $code)->exists());

        $user->update(['affiliate_code' => $code]);

        return $code;
    }

    public function recordCommission(Order $order): void
    {
        if (! $this->isEnabled() || ! $order->user_id) {
            return;
        }

        if ($order->payment_status !== PaymentStatus::Paid) {
            return;
        }

        $code = session(self::SESSION_KEY);
        if (! $code) {
            return;
        }

        $affiliate = $this->findAffiliate($code);
        if (! $affiliate || $affiliate->id === $order->user_id) {
            return;
        }

        if (AffiliateCommission::query()->where('order_id', $order->id)->exists()) {
            return;
        }

        $rate = $this->commissionRate();
        $amount = round((float) $order->total * ($rate / 100), 2);

        AffiliateCommission::query()->create([
            'affiliate_id' => $affiliate->id,
            'order_id' => $order->id,
            'order_total' => $order->total,
            'commission_rate' => $rate,
            'commission_amount' => $amount,
            'status' => 'pending',
        ]);
    }

    protected function findAffiliate(string $code): ?User
    {
        return User::query()
            ->where('affiliate_code', strtoupper($code))
            ->where('is_affiliate', true)
            ->first();
    }
}
