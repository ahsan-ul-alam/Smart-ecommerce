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
}
