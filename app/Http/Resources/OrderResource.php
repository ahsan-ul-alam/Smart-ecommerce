<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'source' => $this->source,
            'customer_name' => $this->customerName(),
            'guest_email' => $this->guest_email,
            'guest_phone' => $this->guest_phone,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'payment_status' => $this->payment_status?->value,
            'payment_method' => $this->payment_method?->value,
            'payment_method_label' => $this->payment_method?->label(),
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'shipping_amount' => (float) $this->shipping_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'coupon_code' => $this->coupon_code,
            'shipping_address' => $this->shipping_address,
            'customer_note' => $this->customer_note,
            'admin_note' => $this->admin_note,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ])),
            'shipment' => $this->whenLoaded('shipment', fn () => [
                'courier' => $this->shipment->courier,
                'tracking_id' => $this->shipment->tracking_id,
                'status' => $this->shipment->status,
            ]),
            'can_request_return' => $this->when(
                $this->relationLoaded('returnRequest'),
                fn () => ! $this->returnRequest
                    && in_array($this->status?->value, ['delivered', 'shipped'], true)
            ),
            'return_request' => $this->whenLoaded('returnRequest', fn () => $this->returnRequest ? [
                'id' => $this->returnRequest->id,
                'status' => $this->returnRequest->status?->value,
                'status_label' => $this->returnRequest->status?->label(),
                'reason' => $this->returnRequest->reason,
                'customer_note' => $this->returnRequest->customer_note,
                'admin_note' => $this->returnRequest->admin_note,
                'created_at' => $this->returnRequest->created_at?->toISOString(),
            ] : null),
            'status_histories' => $this->whenLoaded('statusHistories', fn () => $this->statusHistories->map(fn ($h) => [
                'status' => $h->status?->value,
                'status_label' => $h->status?->label(),
                'note' => $h->note,
                'created_at' => $h->created_at?->toISOString(),
            ])),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
