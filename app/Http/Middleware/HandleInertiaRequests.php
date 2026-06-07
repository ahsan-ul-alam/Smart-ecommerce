<?php

namespace App\Http\Middleware;

use App\Domain\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Page;
use App\Support\MediaUrl;
use App\Services\Commerce\CartService;
use App\Services\Marketing\CampaignService;
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
                    'locales' => collect(config('arcommerze.supported_locales', ['en']))
                        ->map(fn (string $code) => [
                            'code' => $code,
                            'label' => config("arcommerze.locale_labels.{$code}.native")
                                ?? config("arcommerze.locale_labels.{$code}.label")
                                ?? strtoupper($code),
                        ])
                        ->values()
                        ->all(),
                ];
            },
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => MediaUrl::resolve($request->user()->avatar),
                    'roles' => $request->user()->getRoleNames()->values()->all(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->values()->all(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'import_errors' => fn () => $request->session()->get('import_errors', []),
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
            'cartSummary' => fn () => $this->sharedCartTotals($request),
            'shopNav' => fn () => [
                'categories' => Category::query()
                    ->where('is_active', true)
                    ->withCount(['products' => fn ($q) => $q->where('status', ProductStatus::Published)])
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn ($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'products_count' => $c->products_count,
                    ]),
            ],
            'wishlistCount' => fn () => $request->user()
                ? $request->user()->wishlists()->count()
                : 0,
            'footerPages' => fn () => Page::query()
                ->where('is_published', true)
                ->orderBy('title')
                ->get(['title', 'slug']),
            'campaignPopup' => function () use ($request, $modules) {
                if (! $modules->isEnabled('marketing_campaign')) {
                    return null;
                }

                $page = match (true) {
                    $request->routeIs('home') => 'home',
                    $request->routeIs('shop.products.*', 'shop.products') => 'shop',
                    $request->routeIs('shop.cart*') => 'cart',
                    $request->routeIs('shop.checkout*') => 'checkout',
                    default => 'all',
                };

                return app(CampaignService::class)->activePopup($request, $page);
            },
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
