<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Commerce\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function __construct(
        protected CartService $cartService,
    ) {}

    public function create(Request $request): Response
    {
        $intended = (string) $request->session()->get('url.intended', '');
        $portal = $request->query('portal') === 'admin' || str_contains($intended, '/admin')
            ? 'admin'
            : 'shop';

        return Inertia::render('Auth/Login', [
            'status' => session('status'),
            'portal' => $portal,
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $this->cartService->mergeGuestCart($request);

        $user = Auth::user();

        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard'));
        }

        return redirect()->intended(route('account.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
