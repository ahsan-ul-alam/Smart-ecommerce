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
            'filters' => ['hours' => $hours],
        ]);
    }

    public function remind(Cart $cart): RedirectResponse
    {
        $this->abandonedCarts->sendReminder($cart);

        return back()->with('success', 'Recovery reminder sent.');
    }
}
