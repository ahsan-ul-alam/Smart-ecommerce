<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\Marketing\ReferralService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __construct(
        protected ReferralService $referrals,
    ) {}

    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'referral_code' => request()->query('ref'),
        ]);
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $user = User::query()->create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'password' => $request->validated('password'),
            'locale' => $request->validated('locale', 'en'),
            'status' => UserStatus::Active,
        ]);

        $user->assignRole('customer');

        $this->referrals->applyOnRegister($user, $request->validated('referral_code') ?? session('referral_code'));
        $this->referrals->ensureCode($user);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('account.dashboard');
    }
}
