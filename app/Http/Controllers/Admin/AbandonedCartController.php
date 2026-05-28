<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Services\Commerce\AbandonedCartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AbandonedCartController extends Controller
{
    public function __construct(
        protected AbandonedCartService $abandonedCarts,
    ) {}

    public function index(Request $request): Response
    {
        $hours = max(1, min(168, (int) $request->get('hours', 2)));

        return Inertia::render('Admin/AbandonedCarts/Index', [
            'carts' => $this->abandonedCarts->list($hours),
            'stats' => $this->abandonedCarts->stats($hours),
            'filters' => ['hours' => $hours],
            'coupon_module_enabled' => app(\App\Services\Modules\ModuleService::class)->isEnabled('coupon'),
        ]);
    }

    public function remind(Request $request, Cart $cart): RedirectResponse
    {
        $request->validate([
            'recovery_coupon' => ['nullable', 'string', 'max:50'],
        ]);

        $this->abandonedCarts->sendReminder($cart, $request->input('recovery_coupon'));

        return back()->with('success', 'Recovery reminder sent.');
    }
}
