<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\Marketing\CampaignService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function __construct(
        protected CampaignService $campaigns,
    ) {}

    public function dismiss(Request $request, int $campaign): RedirectResponse
    {
        $hours = (int) $request->input('hours', 24);
        $this->campaigns->dismiss($request, $campaign, max(1, $hours));

        return back();
    }
}
