<?php

namespace App\Http\Controllers\Webhooks;

use App\Domain\Enums\IntegrationType;
use App\Domain\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\OrderShipment;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourierWebhookController extends Controller
{
    /**
     * Receives courier status callbacks (e.g. Steadfast delivery_status / tracking_update).
     * Authenticated with the per-courier bearer token configured in Admin → Integrations.
     */
    public function handle(Request $request, string $provider): JsonResponse
    {
        $integration = Integration::query()
            ->where('type', IntegrationType::Courier)
            ->where('provider', $provider)
            ->first();

        // Authorization: Bearer <token>
        $token = $integration?->webhookToken();
        $bearer = $request->bearerToken();

        if (! $token || ! $bearer || ! hash_equals($token, $bearer)) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $notificationType = $request->input('notification_type');

        $trackingId = $request->input('consignment_id')
            ?? $request->input('tracking_id')
            ?? $request->input('trackingId');

        $invoice = $request->input('invoice'); // our order number, when the courier echoes it back

        $shipment = $this->findShipment($provider, $trackingId, $invoice);

        if (! $shipment) {
            return response()->json(['status' => 'error', 'message' => 'Shipment not found'], 404);
        }

        $rawStatus = $request->input('status') ?? $request->input('delivery_status');
        $status = is_string($rawStatus) ? strtolower(trim($rawStatus)) : null;

        $shipment->update([
            'status' => $status ?: ($shipment->status ?: 'updated'),
            'meta' => array_merge($shipment->meta ?? [], [
                'last_event' => $request->all(),
                'tracking_message' => $request->input('tracking_message'),
                'received_at' => now()->toISOString(),
            ]),
        ]);

        // Only a delivery-status event carries an order-affecting status.
        if ($status && $notificationType !== 'tracking_update') {
            $this->syncOrderStatus($shipment, $status);
        }

        return response()->json(['status' => 'success', 'message' => 'Webhook received successfully.']);
    }

    protected function findShipment(string $provider, $trackingId, ?string $invoice): ?OrderShipment
    {
        if ($trackingId) {
            $shipment = OrderShipment::query()
                ->where('courier', $provider)
                ->where('tracking_id', (string) $trackingId)
                ->first();

            if ($shipment) {
                return $shipment;
            }
        }

        if ($invoice) {
            return OrderShipment::query()
                ->where('courier', $provider)
                ->whereHas('order', fn ($q) => $q->where('order_number', $invoice))
                ->first();
        }

        return null;
    }

    /** Map the courier status onto the order and record it in the status history. */
    protected function syncOrderStatus(OrderShipment $shipment, string $status): void
    {
        $mapped = $this->mapStatus($status);
        if (! $mapped) {
            return; // pending / unknown → leave the order as-is
        }

        $order = $shipment->order;
        if (! $order || $order->status === $mapped) {
            return;
        }

        $order->update([
            'status' => $mapped,
            'delivered_at' => $mapped === OrderStatus::Delivered ? now() : $order->delivered_at,
        ]);

        OrderStatusHistory::query()->create([
            'order_id' => $order->id,
            'user_id' => null,
            'status' => $mapped,
            'note' => 'Courier webhook: '.$status,
        ]);
    }

    protected function mapStatus(string $status): ?OrderStatus
    {
        return match (true) {
            str_contains($status, 'return') => OrderStatus::Returned,
            str_contains($status, 'cancel') => OrderStatus::Cancelled,
            // "out for delivery" is still in transit, not delivered.
            str_contains($status, 'out') && str_contains($status, 'deliver') => OrderStatus::Shipped,
            str_contains($status, 'deliver') => OrderStatus::Delivered, // delivered, partial_delivered
            str_contains($status, 'transit')
                || str_contains($status, 'picked')
                || str_contains($status, 'ship')
                || str_contains($status, 'dispatch')
                || str_contains($status, 'way') => OrderStatus::Shipped,
            default => null,
        };
    }
}
