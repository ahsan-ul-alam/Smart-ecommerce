<?php

namespace App\Services\Marketing;

use App\Domain\Enums\CampaignType;
use App\Domain\Enums\CouponType;
use App\Models\MarketingCampaign;
use App\Support\MediaUrl;
use Illuminate\Http\Request;

class CampaignService
{
    public function activePopup(Request $request, string $page = 'all'): ?array
    {
        $campaign = MarketingCampaign::query()
            ->where('type', CampaignType::Popup)
            ->where('is_active', true)
            ->orderByDesc('starts_at')
            ->get()
            ->first(fn ($c) => $c->isRunning() && $c->matchesPage($page));

        if (! $campaign || $this->isDismissed($request, $campaign->id)) {
            return null;
        }

        return [
            'id' => $campaign->id,
            'title' => $campaign->title,
            'body' => $campaign->body,
            'image' => MediaUrl::resolve($campaign->image),
            'coupon_code' => $campaign->coupon_code,
            'cta_label' => $campaign->cta_label,
            'cta_url' => $campaign->cta_url,
            'dismiss_hours' => $campaign->dismiss_hours,
        ];
    }

    public function scheduledDiscount(float $subtotal): float
    {
        if ($subtotal <= 0) {
            return 0;
        }

        $campaign = MarketingCampaign::query()
            ->where('type', CampaignType::ScheduledDiscount)
            ->where('is_active', true)
            ->orderByDesc('starts_at')
            ->get()
            ->first(fn ($c) => $c->isRunning());

        if (! $campaign || ! $campaign->discount_type || ! $campaign->discount_value) {
            return 0;
        }

        return match ($campaign->discount_type) {
            CouponType::Percent => round($subtotal * ($campaign->discount_value / 100), 2),
            CouponType::Fixed => min((float) $campaign->discount_value, $subtotal),
        };
    }

    public function dismiss(Request $request, int $campaignId, int $hours = 24): void
    {
        $request->session()->put("campaign_dismissed_{$campaignId}", now()->addHours($hours)->timestamp);
    }

    protected function isDismissed(Request $request, int $campaignId): bool
    {
        $until = $request->session()->get("campaign_dismissed_{$campaignId}");

        return $until && $until > now()->timestamp;
    }
}
