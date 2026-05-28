<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorCommission;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VendorCommissionController extends Controller
{
    public function index(): Response
    {
        $commissions = VendorCommission::query()
            ->with(['vendor:id,name,slug', 'order:id,order_number,total,source'])
            ->latest()
            ->paginate(20);

        $totals = [
            'pending' => (float) VendorCommission::query()->where('status', 'pending')->sum('commission_amount'),
            'paid' => (float) VendorCommission::query()->where('status', 'paid')->sum('commission_amount'),
        ];

        return Inertia::render('Admin/Vendors/Commissions', [
            'commissions' => $commissions,
            'totals' => $totals,
        ]);
    }

    public function markPaid(VendorCommission $commission): RedirectResponse
    {
        $commission->update(['status' => 'paid', 'paid_at' => now()]);

        return back()->with('success', 'Vendor commission marked as paid.');
    }
}
