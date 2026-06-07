<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Audit\AuditLogService;
use App\Services\Commerce\OrderService;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService,
        protected SettingService $settings,
        protected AuditLogService $audit,
    ) {}

    public function index(Request $request): Response
    {
        $orders = $this->filteredOrdersQuery($request)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $this->paginatedOrders($orders),
            'filters' => $request->only(['search', 'status', 'payment_status', 'source']),
            'sources' => [
                ['value' => '', 'label' => 'All channels'],
                ['value' => 'web', 'label' => 'Online'],
                ['value' => 'pos', 'label' => 'POS'],
            ],
            'statuses' => collect(OrderStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ])->values()->all(),
            'couriers' => collect(config('arcommerze.couriers', []))->map(fn ($label, $key) => [
                'value' => $key,
                'label' => $label,
            ])->values(),
            'paymentStatuses' => collect(PaymentStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => ucfirst($s->value),
            ])->values()->all(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'items.product.images',
            'statusHistories.user',
            'user',
            'shipment',
            'returnRequest',
        ]);

        $customerInsights = null;
        if ($order->user_id) {
            $previousOrder = Order::query()
                ->where('user_id', $order->user_id)
                ->where('id', '!=', $order->id)
                ->latest()
                ->first();

            $customerInsights = [
                'orders_count' => Order::query()->where('user_id', $order->user_id)->count(),
                'total_spent' => (float) Order::query()
                    ->where('user_id', $order->user_id)
                    ->where('payment_status', PaymentStatus::Paid)
                    ->sum('total'),
                'last_order_at' => $previousOrder?->created_at?->toISOString(),
            ];
        }

        $paymentTransaction = PaymentTransaction::query()
            ->where('order_id', $order->id)
            ->latest()
            ->first();

        $order->customer_insights = $customerInsights;
        $order->payment_transaction = $paymentTransaction ? [
            'provider' => $paymentTransaction->provider,
            'payment_id' => $paymentTransaction->payment_id,
            'trx_id' => $paymentTransaction->trx_id,
            'amount' => (float) $paymentTransaction->amount,
            'status' => $paymentTransaction->status,
        ] : null;

        $currentStatus = $order->status;
        $defaultNext = $currentStatus?->defaultNext();

        return Inertia::render('Admin/Orders/Show', [
            'order' => (new OrderResource($order))->resolve(),
            'couriers' => collect(config('arcommerze.couriers', []))->map(fn ($label, $key) => [
                'value' => $key,
                'label' => $label,
            ])->values(),
            'workflowSteps' => collect(OrderStatus::workflowSteps())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ])->values()->all(),
            'nextStatuses' => collect($currentStatus?->nextStatuses() ?? [])->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ])->values()->all(),
            'defaultNext' => $defaultNext ? [
                'value' => $defaultNext->value,
                'label' => $defaultNext->label(),
            ] : null,
            'statuses' => collect(OrderStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
            'paymentStatuses' => collect(PaymentStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => ucfirst($s->value),
            ]),
        ]);
    }

    public function advanceStatus(Request $request, Order $order): RedirectResponse
    {
        $next = $order->status?->defaultNext();

        if (! $next) {
            return back()->with('error', 'This order cannot be advanced further.');
        }

        $oldStatus = $order->status?->value;
        $this->orderService->updateStatus($order, $next, null, $request->user()->id);
        $this->audit->log('order.status_changed', $order, ['status' => $oldStatus], ['status' => $next->value], $request);

        return back()->with('success', "Order marked as {$next->label()}.");
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string'],
            'note' => ['nullable', 'string', 'max:500'],
            'force' => ['nullable', 'boolean'],
        ]);

        $oldStatus = $order->status?->value;
        $newStatus = OrderStatus::from($request->status);

        try {
            $this->orderService->updateStatus(
                $order,
                $newStatus,
                $request->note,
                $request->user()->id,
                $request->boolean('force'),
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        $this->audit->log('order.status_changed', $order, ['status' => $oldStatus], ['status' => $request->status], $request);

        if ($oldStatus === $request->status) {
            return back()->with('success', 'Order status is already '.$newStatus->label().'.');
        }

        return back()->with('success', 'Order status updated to '.$newStatus->label().'.');
    }

    public function updatePayment(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'payment_status' => ['required', 'string'],
        ]);

        $old = $order->payment_status?->value;
        $this->orderService->updatePaymentStatus($order, PaymentStatus::from($request->payment_status));
        $this->audit->log('order.payment_changed', $order, ['payment_status' => $old], ['payment_status' => $request->payment_status], $request);

        return back()->with('success', 'Payment status updated.');
    }

    public function updateNote(Request $request, Order $order): RedirectResponse
    {
        $request->validate(['admin_note' => ['nullable', 'string', 'max:1000']]);
        $order->update(['admin_note' => $request->admin_note]);

        return back()->with('success', 'Note saved.');
    }

    public function partialRefund(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $this->orderService->recordPartialRefund($order, (float) $data['amount'], $data['note'] ?? null, $request->user()->id);

        return back()->with('success', 'Refund recorded.');
    }

    public function retryPayment(Request $request, Order $order): RedirectResponse
    {
        \App\Jobs\RetryFailedPayment::dispatch($order->id);

        return back()->with('success', 'Payment retry queued.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filename = 'orders-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($request) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Order Number', 'Source', 'Customer', 'Phone', 'Email',
                'Status', 'Payment Status', 'Payment Method',
                'Subtotal', 'Discount', 'Shipping', 'Tax', 'Total', 'Created At',
            ]);

            $this->filteredOrdersQuery($request)->chunk(100, function ($orders) use ($handle) {
                foreach ($orders as $order) {
                    fputcsv($handle, [
                        $order->order_number,
                        $order->source ?? 'web',
                        $order->customerName(),
                        $order->guest_phone,
                        $order->guest_email ?? $order->user?->email,
                        $order->status?->value,
                        $order->payment_status?->value,
                        $order->payment_method?->value,
                        $order->subtotal,
                        $order->discount_amount,
                        $order->shipping_amount,
                        $order->tax_amount,
                        $order->total,
                        $order->created_at?->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function invoice(Order $order): Response
    {
        $order->load(['items', 'user:id,name,email']);

        return Inertia::render('Admin/Orders/Invoice', [
            'order' => (new OrderResource($order))->resolve(),
            'store' => $this->storeDetails(),
        ]);
    }

    public function packingSlip(Order $order): Response
    {
        $order->load(['items', 'user:id,name,email', 'shipment']);

        return Inertia::render('Admin/Orders/PackingSlip', [
            'order' => (new OrderResource($order))->resolve(),
            'store' => $this->storeDetails(),
        ]);
    }

    protected function filteredOrdersQuery(Request $request)
    {
        return Order::query()
            ->with(['user:id,name,email', 'shipment'])
            ->withCount('items')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('order_number', 'like', "%{$search}%")
                        ->orWhere('guest_name', 'like', "%{$search}%")
                        ->orWhere('guest_phone', 'like', "%{$search}%")
                        ->orWhere('guest_email', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->payment_status, fn ($q, $s) => $q->where('payment_status', $s))
            ->when($request->source, fn ($q, $s) => $q->where('source', $s))
            ->latest();
    }

    protected function storeDetails(): array
    {
        $branding = $this->settings->branding();

        return [
            'name' => $branding['site_name'],
            'phone' => $branding['store_phone'],
            'address' => $branding['store_address'],
            'email' => $branding['store_email'],
            'logo' => $branding['logo'],
        ];
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, links: array<int, array<string, mixed>>, meta: array<string, mixed>}
     */
    protected function paginatedOrders($paginator): array
    {
        return [
            'data' => OrderResource::collection($paginator->items())->resolve(),
            'links' => $paginator->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];
    }
}
