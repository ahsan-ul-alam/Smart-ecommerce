<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AffiliateCommission;
use App\Models\User;
use App\Services\Marketing\AffiliateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateController extends Controller
{
    public function __construct(
        protected AffiliateService $affiliates,
    ) {}

    public function index(): Response
    {
        $commissions = AffiliateCommission::query()
            ->with(['affiliate:id,name,email,affiliate_code', 'order:id,order_number,total'])
            ->latest()
            ->paginate(20);

        $affiliates = User::query()
            ->where('is_affiliate', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'affiliate_code']);

        return Inertia::render('Admin/Affiliates/Index', [
            'commissions' => $commissions,
            'affiliates' => $affiliates,
            'commission_rate' => $this->affiliates->commissionRate(),
        ]);
    }

    public function toggleAffiliate(Request $request, User $customer): RedirectResponse
    {
        $request->validate(['is_affiliate' => ['required', 'boolean']]);

        $customer->update(['is_affiliate' => $request->boolean('is_affiliate')]);

        if ($customer->is_affiliate) {
            $this->affiliates->ensureCode($customer);
        }

        return back()->with('success', 'Affiliate status updated.');
    }

    public function markPaid(AffiliateCommission $commission): RedirectResponse
    {
        $commission->update(['status' => 'paid', 'paid_at' => now()]);

        return back()->with('success', 'Commission marked as paid.');
    }
}
