<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\OrderShipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourierWebhookController extends Controller
{
    public function handle(Request $request, string $provider): JsonResponse
    {
        $trackingId = $request->input('tracking_id')
            ?? $request->input('consignment_id')
            ?? $request->input('trackingId');

        $status = $request->input('status')
            ?? $request->input('delivery_status')
            ?? 'updated';

        if ($trackingId) {
            $shipment = OrderShipment::query()
                ->where('courier', $provider)
                ->where('tracking_id', $trackingId)
                ->first();

            if ($shipment) {
                $shipment->update([
                    'status' => is_string($status) ? strtolower($status) : 'updated',
                    'meta' => array_merge($shipment->meta ?? [], [
                        'webhook' => $request->all(),
                        'received_at' => now()->toISOString(),
                    ]),
                ]);
            }
        }

        return response()->json(['ok' => true, 'provider' => $provider]);
    }
}
