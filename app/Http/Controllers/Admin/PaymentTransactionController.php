<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $transactions = PaymentTransaction::query()
            ->with('order:id,order_number')
            ->when($request->filled('provider'), fn ($q) => $q->where('provider', $request->provider))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(25)
            ->through(fn (PaymentTransaction $tx) => [
                'id' => $tx->id,
                'order_id' => $tx->order_id,
                'order_number' => $tx->order?->order_number,
                'provider' => $tx->provider,
                'payment_id' => $tx->payment_id,
                'trx_id' => $tx->trx_id,
                'amount' => (float) $tx->amount,
                'currency' => $tx->currency,
                'status' => $tx->status,
                'customer_phone' => $tx->customer_phone,
                'created_at' => $tx->created_at?->toISOString(),
            ]);

        return Inertia::render('Admin/PaymentTransactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['provider', 'status']),
            'providers' => PaymentTransaction::query()->distinct()->pluck('provider')->filter()->values(),
        ]);
    }
}
