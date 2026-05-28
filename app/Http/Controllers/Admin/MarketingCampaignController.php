<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\CampaignType;
use App\Domain\Enums\CouponType;
use App\Http\Controllers\Controller;
use App\Models\MarketingCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingCampaignController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/MarketingCampaigns/Index', [
            'campaigns' => MarketingCampaign::query()->latest()->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'type' => $c->type->value,
                'title' => $c->title,
                'body' => $c->body,
                'image' => $c->image,
                'coupon_code' => $c->coupon_code,
                'discount_type' => $c->discount_type?->value,
                'discount_value' => $c->discount_value ? (float) $c->discount_value : null,
                'cta_label' => $c->cta_label,
                'cta_url' => $c->cta_url,
                'show_on' => $c->show_on ?? ['all'],
                'dismiss_hours' => $c->dismiss_hours,
                'starts_at' => $c->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $c->ends_at?->format('Y-m-d\TH:i'),
                'is_active' => $c->is_active,
                'is_running' => $c->isRunning(),
            ]),
            'types' => collect(CampaignType::cases())->map(fn ($t) => ['value' => $t->value, 'label' => str_replace('_', ' ', ucfirst($t->value))]),
            'discountTypes' => collect(CouponType::cases())->map(fn ($t) => ['value' => $t->value, 'label' => ucfirst($t->value)]),
            'pageTargets' => [
                ['value' => 'all', 'label' => 'All pages'],
                ['value' => 'home', 'label' => 'Home'],
                ['value' => 'shop', 'label' => 'Shop'],
                ['value' => 'product', 'label' => 'Product'],
                ['value' => 'cart', 'label' => 'Cart'],
                ['value' => 'checkout', 'label' => 'Checkout'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        MarketingCampaign::query()->create($this->validated($request));

        return back()->with('success', 'Campaign created.');
    }

    public function update(Request $request, MarketingCampaign $marketingCampaign): RedirectResponse
    {
        $marketingCampaign->update($this->validated($request));

        return back()->with('success', 'Campaign updated.');
    }

    public function destroy(MarketingCampaign $marketingCampaign): RedirectResponse
    {
        $marketingCampaign->delete();

        return back()->with('success', 'Campaign deleted.');
    }

    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:popup,scheduled_discount'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'discount_type' => ['nullable', 'in:percent,fixed'],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'cta_label' => ['nullable', 'string', 'max:100'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'show_on' => ['nullable', 'array'],
            'show_on.*' => ['string', 'max:50'],
            'dismiss_hours' => ['nullable', 'integer', 'min:1', 'max:720'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['boolean'],
        ]);

        $data['coupon_code'] = $data['coupon_code'] ? strtoupper($data['coupon_code']) : null;
        $data['show_on'] = $data['show_on'] ?? ['all'];
        $data['dismiss_hours'] = $data['dismiss_hours'] ?? 24;
        $data['is_active'] = $request->boolean('is_active');

        if ($data['type'] === CampaignType::ScheduledDiscount->value) {
            $data['discount_type'] = $data['discount_type'] ?? CouponType::Percent->value;
        } else {
            $data['discount_type'] = null;
            $data['discount_value'] = null;
        }

        return $data;
    }
}
