<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShippingZoneController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ShippingZones/Index', [
            'zones' => ShippingZone::query()->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        ShippingZone::query()->create($data);

        return back()->with('success', 'Shipping zone created.');
    }

    public function update(Request $request, ShippingZone $shippingZone): RedirectResponse
    {
        $shippingZone->update($this->validated($request));

        return back()->with('success', 'Shipping zone updated.');
    }

    public function destroy(ShippingZone $shippingZone): RedirectResponse
    {
        $shippingZone->delete();

        return back()->with('success', 'Shipping zone removed.');
    }

    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'districts' => ['required', 'string', 'max:2000'],
            'shipping_charge' => ['required', 'numeric', 'min:0'],
            'free_shipping_min' => ['nullable', 'numeric', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $districts = array_values(array_filter(array_map(
            'trim',
            preg_split('/[\r\n,]+/', $data['districts'])
        )));

        return [
            'name' => $data['name'],
            'districts' => $districts,
            'shipping_charge' => $data['shipping_charge'],
            'free_shipping_min' => $data['free_shipping_min'] ?? null,
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => $request->boolean('is_active', true),
        ];
    }
}
