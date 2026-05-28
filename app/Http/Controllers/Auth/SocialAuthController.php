<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Commerce\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function __construct(
        protected CartService $cartService,
    ) {}

    public function redirect(string $provider): RedirectResponse
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $socialUser = Socialite::driver($provider)->user();

        $user = User::query()->updateOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'email_verified_at' => now(),
                'status' => UserStatus::Active,
            ]
        );

        if (! $user->hasAnyRole(['super_admin', 'admin', 'staff', 'customer'])) {
            $user->assignRole('customer');
        }

        Auth::login($user, true);
        request()->session()->regenerate();
        $this->cartService->mergeGuestCart(request());

        return redirect()->intended(
            $user->isAdmin() ? route('admin.dashboard') : route('account.dashboard')
        );
    }
}
