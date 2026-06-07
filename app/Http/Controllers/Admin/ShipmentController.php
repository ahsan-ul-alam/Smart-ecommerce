<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\IntegrationType;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderShipment;
use App\Services\Integrations\IntegrationManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function __construct(
        protected IntegrationManager $integrations,
    ) {}

    public function store(Request $request, Order $order): RedirectResponse
    {
        $request->validate(['courier' => ['required', 'string']]);

        $courier = $this->integrations->resolveCourier($request->courier);
        $address = $order->shipping_address;

        $result = $courier->createConsignment([
            'order_number' => $order->order_number,
            'recipient_name' => $address['name'] ?? '',
            'recipient_phone' => $address['phone'] ?? '',
            'address' => trim(($address['address_line_1'] ?? '').' '.($address['address_line_2'] ?? '')),
            'city' => $address['city'] ?? 'Dhaka',
            'cod_amount' => $order->payment_method->value === 'cod' ? $order->total : 0,
        ]);

        OrderShipment::query()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'courier' => $request->courier,
                'tracking_id' => $result['tracking_id'] ?? null,
                'status' => $result['status'] ?? 'pending',
                'cod_amount' => $order->payment_method->value === 'cod' ? $order->total : null,
                'meta' => $result,
            ]
        );

        return back()->with('success', 'Shipment created with '.$request->courier);
    }

    public function sync(Order $order): RedirectResponse
    {
        $shipment = $order->shipment;

        if (! $shipment?->tracking_id) {
            return back()->with('error', 'No tracking ID on this shipment.');
        }

        $courier = $this->integrations->resolveCourier($shipment->courier);
        $result = $courier->trackShipment($shipment->tracking_id);

        if (! empty($result['message']) && in_array($result['status'] ?? '', ['unknown', 'failed'], true)) {
            return back()->with('error', $result['message']);
        }

        $shipment->update([
            'status' => $result['status'] ?? $shipment->status,
            'meta' => array_merge($shipment->meta ?? [], ['last_track' => $result]),
        ]);

        if (! empty($result['message'])) {
            return back()->with('success', $result['message']);
        }

        return back()->with('success', 'Tracking updated from '.$shipment->courier);
    }
}
