<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\Customer\LoyaltyService;
use App\Services\Customer\WalletService;
use App\Services\Marketing\AffiliateService;
use App\Services\Marketing\ReferralService;
use App\Services\Modules\ModuleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RewardsController extends Controller
{
    public function __construct(
        protected LoyaltyService $loyalty,
        protected WalletService $wallet,
        protected ModuleService $modules,
        protected ReferralService $referrals,
        protected AffiliateService $affiliates,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $referralCode = $this->referrals->isEnabled() ? $this->referrals->ensureCode($user) : null;
        $loyaltyAccount = $this->loyalty->isEnabled() ? $this->loyalty->account($user) : null;
        $wallet = $this->wallet->isEnabled() ? $this->wallet->wallet($user) : null;

        return Inertia::render('Customer/Rewards', [
            'referral_enabled' => $this->referrals->isEnabled(),
            'referral_code' => $referralCode,
            'referral_link' => $referralCode ? url('/register?ref='.$referralCode) : null,
            'referral_reward' => (float) $this->referrals->isEnabled()
                ? app(\App\Services\Settings\SettingService::class)->get('commerce', 'referral_reward_amount', 50)
                : 0,
            'referrals_made' => $this->referrals->isEnabled()
                ? $user->referralsMade()->with('referred:id,name,email')->latest()->limit(10)->get()->map(fn ($r) => [
                    'id' => $r->id,
                    'referred_name' => $r->referred?->name,
                    'status' => $r->status,
                    'reward_amount' => (float) $r->reward_amount,
                    'rewarded_at' => $r->rewarded_at?->toISOString(),
                ])
                : [],
            'loyalty_enabled' => $this->loyalty->isEnabled(),
            'wallet_enabled' => $this->wallet->isEnabled(),
            'points' => $loyaltyAccount?->points ?? 0,
            'point_value' => $this->loyalty->pointValue(),
            'min_redeem' => $this->loyalty->minRedeemPoints(),
            'points_per_100' => $this->loyalty->pointsPer100Taka(),
            'wallet_balance' => (float) ($wallet?->balance ?? 0),
            'loyalty_history' => $loyaltyAccount
                ? $loyaltyAccount->transactions()->limit(20)->get()->map(fn ($t) => [
                    'id' => $t->id,
                    'type' => $t->type,
                    'points' => $t->points,
                    'balance_after' => $t->balance_after,
                    'description' => $t->description,
                    'created_at' => $t->created_at?->toISOString(),
                ])
                : [],
            'affiliate_enabled' => $this->affiliates->isEnabled(),
            'is_affiliate' => $user->is_affiliate,
            'affiliate_code' => $user->is_affiliate ? $this->affiliates->ensureCode($user) : null,
            'affiliate_link' => $user->is_affiliate && $this->affiliates->isEnabled()
                ? url('/?aff='.$this->affiliates->ensureCode($user))
                : null,
            'affiliate_commission_rate' => $this->affiliates->commissionRate(),
            'affiliate_earnings' => $user->is_affiliate
                ? $user->affiliateCommissions()->sum('commission_amount')
                : 0,
            'affiliate_commissions' => $user->is_affiliate
                ? $user->affiliateCommissions()->with('order:id,order_number')->latest()->limit(10)->get()->map(fn ($c) => [
                    'id' => $c->id,
                    'order_number' => $c->order?->order_number,
                    'commission_amount' => (float) $c->commission_amount,
                    'status' => $c->status,
                    'created_at' => $c->created_at?->toISOString(),
                ])
                : [],
            'wallet_history' => $wallet
                ? $wallet->transactions()->limit(20)->get()->map(fn ($t) => [
                    'id' => $t->id,
                    'type' => $t->type,
                    'amount' => (float) $t->amount,
                    'balance_after' => (float) $t->balance_after,
                    'description' => $t->description,
                    'created_at' => $t->created_at?->toISOString(),
                ])
                : [],
        ]);
    }
}
