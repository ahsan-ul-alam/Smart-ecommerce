<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Services\Geo\BangladeshLocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Validator;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function __construct(
        protected BangladeshLocationService $locations,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Customer/Addresses/Index', [
            'addresses' => $request->user()->addresses()->latest()->get()
                ->map(fn ($addr) => $this->mapForForm($addr)),
            'divisions' => $this->locations->divisions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateAddress($request);

        if ($data['is_default'] ?? false) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $request->user()->addresses()->create($this->persistPayload($data));

        return back()->with('success', 'Address saved.');
    }

    public function update(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $data = $this->validateAddress($request);

        if ($data['is_default'] ?? false) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($this->persistPayload($data));

        return back()->with('success', 'Address updated.');
    }

    public function destroy(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);
        $address->delete();

        return back()->with('success', 'Address deleted.');
    }

    protected function validateAddress(Request $request): array
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email'],
            'division' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'thana' => ['required', 'string', 'max:100'],
            'local_address' => ['required', 'string', 'max:500'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'is_default' => ['boolean'],
        ]);

        $validator = validator($data);
        $validator->after(function (Validator $v) use ($data) {
            if ($v->errors()->isNotEmpty()) {
                return;
            }

            if (! $this->locations->validate($data['division'], $data['district'], $data['thana'])) {
                $v->errors()->add('thana', 'Please select a valid thana for the chosen district.');
            }
        });

        $validator->validate();

        return $data;
    }

    protected function persistPayload(array $data): array
    {
        $district = $this->locations->normalizeDistrictForShipping($data['district']);

        return [
            'label' => $data['label'],
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'division' => $data['division'],
            'district' => $district,
            'thana' => $data['thana'],
            'local_address' => $data['local_address'],
            'address_line_1' => $data['local_address'],
            'address_line_2' => null,
            'city' => $data['thana'],
            'postal_code' => $data['postal_code'] ?? null,
            'country' => 'Bangladesh',
            'is_default' => $data['is_default'] ?? false,
        ];
    }

    protected function mapForForm(Address $addr): array
    {
        return [
            'id' => $addr->id,
            'label' => $addr->label,
            'name' => $addr->name,
            'phone' => $addr->phone,
            'email' => $addr->email,
            'division' => $addr->division ?: $this->locations->findDivisionForDistrict($addr->district),
            'district' => $addr->district,
            'thana' => $addr->thana ?: $addr->city,
            'local_address' => $addr->local_address ?: $addr->address_line_1,
            'postal_code' => $addr->postal_code,
            'is_default' => $addr->is_default,
        ];
    }
}
