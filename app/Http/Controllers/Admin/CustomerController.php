<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\User;
use App\Services\Customer\LoyaltyService;
use App\Services\Customer\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    public function __construct(
        protected LoyaltyService $loyalty,
        protected WalletService $wallet,
    ) {}

    public function index(Request $request): Response
    {
        $customers = $this->filteredCustomersQuery($request)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status?->value,
                'status_label' => $user->status?->label(),
                'orders_count' => $user->orders_count,
                'created_at' => $user->created_at?->toISOString(),
            ]),
            'filters' => $request->only(['search', 'status']),
            'statuses' => collect(UserStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filename = 'customers-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($request) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Name', 'Email', 'Phone', 'Status', 'Orders', 'Registered']);

            $this->filteredCustomersQuery($request)->chunk(100, function ($customers) use ($handle) {
                foreach ($customers as $user) {
                    fputcsv($handle, [
                        $user->name,
                        $user->email,
                        $user->phone,
                        $user->status?->value,
                        $user->orders_count,
                        $user->created_at?->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function show(User $customer): Response
    {
        abort_unless($customer->hasRole('customer'), 404);

        $customer->loadCount('orders', 'addresses', 'wishlists');
        $orders = $customer->orders()->latest()->limit(10)->get();
        $totalSpent = (float) $customer->orders()->sum('total');
        $loyalty = $this->loyalty->account($customer);
        $wallet = $this->wallet->wallet($customer);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'status' => $customer->status?->value,
                'status_label' => $customer->status?->label(),
                'customer_notes' => $customer->customer_notes,
                'orders_count' => $customer->orders_count,
                'addresses_count' => $customer->addresses_count,
                'wishlists_count' => $customer->wishlists_count,
                'total_spent' => round($totalSpent, 2),
                'created_at' => $customer->created_at?->toISOString(),
                'provider' => $customer->provider,
                'loyalty_points' => $loyalty->points,
                'wallet_balance' => (float) $wallet->balance,
                'is_affiliate' => $customer->is_affiliate,
                'affiliate_code' => $customer->affiliate_code,
            ],
            'orders' => OrderResource::collection($orders)->resolve(),
            'statuses' => collect(UserStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
            'addresses' => $customer->addresses()->latest()->get()->map(fn ($a) => [
                'id' => $a->id,
                'label' => $a->label,
                'name' => $a->name,
                'phone' => $a->phone,
                'address_line_1' => $a->address_line_1,
                'city' => $a->city,
                'district' => $a->district,
                'is_default' => $a->is_default,
            ]),
        ]);
    }

    public function update(Request $request, User $customer): RedirectResponse
    {
        abort_unless($customer->hasRole('customer'), 404);

        $data = $request->validate([
            'status' => ['required', Rule::enum(UserStatus::class)],
            'customer_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $customer->update($data);

        return back()->with('success', 'Customer updated.');
    }

    public function creditWallet(Request $request, User $customer): RedirectResponse
    {
        abort_unless($customer->hasRole('customer'), 404);

        $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $this->wallet->credit(
            $customer,
            (float) $request->amount,
            $request->description ?? 'Admin wallet credit'
        );

        return back()->with('success', 'Wallet credited successfully.');
    }

    public function adjustLoyalty(Request $request, User $customer): RedirectResponse
    {
        abort_unless($customer->hasRole('customer'), 404);

        $request->validate([
            'points' => ['required', 'integer'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $this->loyalty->adjust(
            $customer,
            (int) $request->points,
            $request->description ?? 'Admin adjustment'
        );

        return back()->with('success', 'Loyalty points updated.');
    }

    protected function filteredCustomersQuery(Request $request)
    {
        return User::role('customer')
            ->withCount('orders')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest();
    }
}
