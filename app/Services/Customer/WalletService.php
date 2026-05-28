<?php

namespace App\Services\Customer;

use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Modules\ModuleService;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function __construct(
        protected ModuleService $modules,
    ) {}

    public function isEnabled(): bool
    {
        return $this->modules->isEnabled('wallet');
    }

    public function wallet(User $user): Wallet
    {
        return Wallet::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );
    }

    public function previewUsage(User $user, float $amount, float $maxApplicable): float
    {
        if (! $this->isEnabled()) {
            return 0.0;
        }

        $balance = (float) $this->wallet($user)->balance;

        return round(min(max(0, $amount), $balance, $maxApplicable), 2);
    }

    public function debit(User $user, float $amount, Order $order): void
    {
        if ($amount <= 0) {
            return;
        }

        $wallet = $this->wallet($user);

        if ((float) $wallet->balance < $amount) {
            throw ValidationException::withMessages(['wallet_amount' => 'Insufficient wallet balance.']);
        }

        $wallet->decrement('balance', $amount);

        $wallet->transactions()->create([
            'order_id' => $order->id,
            'type' => 'debit',
            'amount' => $amount,
            'balance_after' => $wallet->fresh()->balance,
            'description' => "Payment for order #{$order->order_number}",
        ]);
    }

    public function credit(User $user, float $amount, ?string $description = null, ?Order $order = null): Wallet
    {
        $wallet = $this->wallet($user);
        $wallet->increment('balance', $amount);

        $wallet->transactions()->create([
            'order_id' => $order?->id,
            'type' => 'credit',
            'amount' => $amount,
            'balance_after' => $wallet->fresh()->balance,
            'description' => $description ?? 'Wallet top-up',
        ]);

        return $wallet->fresh();
    }
}
