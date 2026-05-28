<?php

namespace App\Http\Middleware;

use App\Models\Page;
use App\Services\Commerce\CartService;
use App\Services\Modules\ModuleService;
use App\Services\Settings\SettingService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $settings = app(SettingService::class);
        $modules = app(ModuleService::class);

        return [
            ...parent::share($request),
            'app' => function () use ($settings) {
                $b = $settings->branding();

                return [
                    'name' => $b['site_name'],
                    'tagline' => $b['site_tagline'],
                    'currency' => $b['currency'],
                    'currency_symbol' => $b['currency_symbol'],
                    'locale' => app()->getLocale(),
                    'locales' => config('arcommerze.supported_locales'),
                ];
            },
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->avatar,
                    'roles' => $request->user()->getRoleNames()->values()->all(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->values()->all(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'settings' => fn () => $settings->getPublicSettings(),
            'theme' => function () use ($settings) {
                $b = $settings->branding();

                return [
                    'primary_color' => $b['primary_color'],
                    'secondary_color' => $b['secondary_color'],
                    'logo' => $b['logo'],
                    'favicon' => $b['favicon'],
                    'dark_mode_default' => $b['dark_mode_default'],
                ];
            },
            'branding' => fn () => $settings->branding(),
            'modules' => fn () => $modules->enabledKeys(),
            'cart' => fn () => $this->sharedCartTotals($request),
            'footerPages' => fn () => Page::query()
                ->where('is_published', true)
                ->orderBy('title')
                ->get(['title', 'slug']),
        ];
    }

    protected function sharedCartTotals(Request $request): array
    {
        try {
            $cart = app(CartService::class)->resolve($request)->load('items.product');

            return app(CartService::class)->calculateTotals($cart);
        } catch (\Throwable) {
            return [
                'subtotal' => 0,
                'discount' => 0,
                'loyalty_discount' => 0,
                'wallet_used' => 0,
                'shipping' => 0,
                'tax' => 0,
                'total' => 0,
                'item_count' => 0,
            ];
        }
    }
}
