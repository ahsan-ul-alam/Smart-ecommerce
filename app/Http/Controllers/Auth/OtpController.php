<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\OtpService;
use App\Services\Commerce\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class OtpController extends Controller
{
    public function __construct(
        protected OtpService $otp,
        protected CartService $cartService,
    ) {}

    public function send(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'min:10', 'max:20'],
        ]);

        $this->otp->send($data['phone']);

        return back()->with('status', 'Verification code sent to your phone.');
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'min:10', 'max:20'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $this->otp->verify($data['phone'], $data['code']);

        $phone = preg_replace('/\D+/', '', $data['phone']);
        $user = User::query()->where('phone', $phone)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'No account found for this phone number. Please register first.',
            ]);
        }

        $user->forceFill(['phone_verified_at' => now()])->save();

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        $this->cartService->mergeGuestCart($request);

        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard'));
        }

        return redirect()->intended(route('account.dashboard'));
    }
}
