<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Domain\Enums\IntegrationType;
use App\Models\Integration;
use App\Models\Module;
use App\Services\Audit\AuditLogService;
use App\Services\Modules\ModuleService;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        protected SettingService $settings,
        protected ModuleService $modules,
        protected AuditLogService $audit,
    ) {}

    public function general(): Response
    {
        return $this->site();
    }

    public function site(): Response
    {
        $branding = $this->settings->branding();

        return Inertia::render('Admin/Settings/Site', [
            'settings' => [
                'site_name' => $branding['site_name'],
                'site_tagline' => $branding['site_tagline'],
                'store_phone' => $branding['store_phone'],
                'store_email' => $branding['store_email'],
                'store_address' => $branding['store_address'],
                'currency' => $branding['currency'],
                'currency_symbol' => $branding['currency_symbol'],
                'timezone' => $branding['timezone'],
                'maintenance_mode' => $branding['maintenance_mode'],
                'maintenance_message' => (string) $this->settings->get('general', 'maintenance_message', ''),
                'primary_color' => $branding['primary_color'],
                'secondary_color' => $branding['secondary_color'],
                'dark_mode_default' => $branding['dark_mode_default'],
            ],
            'logo_url' => $branding['logo'],
            'favicon_url' => $branding['favicon'],
        ]);
    }

    public function updateGeneral(UpdateSettingsRequest $request): RedirectResponse
    {
        return $this->updateSite($request);
    }

    public function updateSite(Request $request): RedirectResponse
    {
        $request->merge([
            'settings' => $this->normalizeSettingsInput($request->input('settings', [])),
        ]);

        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.site_name' => ['required', 'string', 'max:255'],
            'settings.site_tagline' => ['nullable', 'string', 'max:500'],
            'settings.store_phone' => ['nullable', 'string', 'max:30'],
            'settings.store_email' => ['nullable', 'string', 'email', 'max:255'],
            'settings.store_address' => ['nullable', 'string', 'max:500'],
            'settings.currency' => ['nullable', 'string', 'max:10'],
            'settings.currency_symbol' => ['nullable', 'string', 'max:5'],
            'settings.timezone' => ['nullable', 'string', 'max:64'],
            'settings.maintenance_mode' => ['nullable'],
            'settings.maintenance_message' => ['nullable', 'string', 'max:1000'],
            'settings.primary_color' => ['nullable', 'string', 'max:20'],
            'settings.secondary_color' => ['nullable', 'string', 'max:20'],
            'settings.dark_mode_default' => ['nullable'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,svg', 'max:2048'],
            'favicon' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,ico', 'max:1024'],
            'remove_logo' => ['nullable', 'boolean'],
            'remove_favicon' => ['nullable', 'boolean'],
        ]);

        $settings = $data['settings'];

        $this->settings->set('general', 'site_name', $settings['site_name']);
        $this->settings->set('general', 'site_tagline', $settings['site_tagline'] ?? '');
        $this->settings->set('general', 'store_phone', $settings['store_phone'] ?? '');
        $this->settings->set('general', 'store_email', $settings['store_email'] ?? '');
        $this->settings->set('general', 'store_address', $settings['store_address'] ?? '');
        $this->settings->set('general', 'currency', $settings['currency'] ?? 'BDT');
        $this->settings->set('general', 'currency_symbol', $settings['currency_symbol'] ?? '৳');
        $this->settings->set('general', 'timezone', $settings['timezone'] ?? 'Asia/Dhaka');
        $this->settings->set('general', 'maintenance_mode', $this->settingsBoolean($request, 'maintenance_mode'), 'boolean');
        $this->settings->set('general', 'maintenance_message', $settings['maintenance_message'] ?? '');

        $this->settings->set('theme', 'primary_color', $settings['primary_color'] ?? '#0f766e');
        $this->settings->set('theme', 'secondary_color', $settings['secondary_color'] ?? '#f59e0b');
        $this->settings->set('theme', 'dark_mode_default', $this->settingsBoolean($request, 'dark_mode_default'), 'boolean');

        if ($request->boolean('remove_logo')) {
            $this->settings->removeBrandAsset('logo');
        }

        if ($request->boolean('remove_favicon')) {
            $this->settings->removeBrandAsset('favicon');
        }

        if ($request->hasFile('logo')) {
            $this->settings->storeBrandAsset('logo', $request->file('logo'));
        }

        if ($request->hasFile('favicon')) {
            $this->settings->storeBrandAsset('favicon', $request->file('favicon'));
        }

        $this->audit->log('settings.site_updated', null, null, ['site_name' => $settings['site_name']], $request);

        return back()->with('success', 'Site settings saved. Changes apply across the storefront and admin.');
    }

    public function commerce(): Response
    {
        return Inertia::render('Admin/Settings/Commerce', [
            'settings' => $this->settings->getGroup('commerce'),
        ]);
    }

    public function notifications(): Response
    {
        return Inertia::render('Admin/Settings/Notifications', [
            'settings' => $this->settings->getGroup('notifications'),
        ]);
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
            'settings.email_order_confirmation' => ['nullable', 'boolean'],
            'settings.sms_order_confirmation' => ['nullable', 'boolean'],
            'settings.abandoned_cart_email' => ['nullable', 'boolean'],
            'settings.abandoned_cart_sms' => ['nullable', 'boolean'],
            'settings.low_stock_alert' => ['nullable', 'boolean'],
            'settings.abandoned_cart_recovery_coupon' => ['nullable', 'string', 'max:50'],
        ]);

        $input = $request->input('settings', []);
        $booleanKeys = [
            'email_order_confirmation',
            'sms_order_confirmation',
            'abandoned_cart_email',
            'abandoned_cart_sms',
            'low_stock_alert',
        ];

        foreach ($booleanKeys as $key) {
            $this->settings->set('notifications', $key, $this->settingsBoolean($request, $key, "settings.{$key}"), 'boolean');
            unset($input[$key]);
        }

        $this->settings->updateGroup('notifications', $input);

        return back()->with('success', 'Notification settings updated.');
    }

    public function theme(): Response
    {
        return $this->site();
    }

    public function updateTheme(Request $request): RedirectResponse
    {
        return $this->updateSite($request);
    }

    public function updateCommerce(Request $request): RedirectResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
            'settings.shipping_charge' => ['nullable', 'numeric', 'min:0'],
            'settings.free_shipping_min' => ['nullable', 'numeric', 'min:0'],
            'settings.loyalty_points_per_100' => ['nullable', 'integer', 'min:0'],
            'settings.loyalty_point_value' => ['nullable', 'numeric', 'min:0'],
            'settings.loyalty_min_redeem' => ['nullable', 'integer', 'min:0'],
            'settings.referral_reward_amount' => ['nullable', 'numeric', 'min:0'],
            'settings.referral_reward_type' => ['nullable', 'in:wallet,loyalty'],
            'settings.affiliate_commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'settings.tax_enabled' => ['nullable', 'boolean'],
            'settings.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'settings.tax_label' => ['nullable', 'string', 'max:50'],
        ]);

        $payload = $request->input('settings', []);
        $this->settings->set('commerce', 'tax_enabled', $this->settingsBoolean($request, 'tax_enabled'), 'boolean');
        unset($payload['tax_enabled']);
        $this->settings->updateGroup('commerce', $payload);

        return back()->with('success', 'Commerce settings updated.');
    }

    protected function normalizeSettingsInput(array $settings): array
    {
        foreach (['store_email', 'store_phone', 'site_tagline', 'store_address', 'maintenance_message'] as $key) {
            if (array_key_exists($key, $settings) && $settings[$key] === '') {
                $settings[$key] = null;
            }
        }

        return $settings;
    }

    protected function settingsBoolean(Request $request, string $key, ?string $inputKey = null): bool
    {
        return filter_var($request->input($inputKey ?? "settings.{$key}"), FILTER_VALIDATE_BOOLEAN);
    }

    public function modules(): Response
    {
        return Inertia::render('Admin/Settings/Modules', [
            'modules' => Module::query()->orderBy('sort_order')->get(),
        ]);
    }

    public function toggleModule(Request $request, string $key): RedirectResponse
    {
        $request->validate(['enabled' => ['required', 'boolean']]);
        $this->modules->toggle($key, $request->boolean('enabled'));

        return back()->with('success', 'Module updated successfully.');
    }

    public function integrations(string $type): Response
    {
        $integrationType = IntegrationType::tryFrom($type) ?? IntegrationType::Payment;

        return Inertia::render('Admin/Settings/Integrations', [
            'type' => $type,
            'integrations' => Integration::query()
                ->where('type', $integrationType)
                ->orderBy('priority')
                ->get([
                    'id',
                    'type',
                    'provider',
                    'label',
                    'is_enabled',
                    'is_sandbox',
                    'priority',
                ]),
        ]);
    }
}
