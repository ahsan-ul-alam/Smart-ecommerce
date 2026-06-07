<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
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
                'phone' => $this->user->phone,
            ]),
            'customer_phone' => $this->guest_phone ?? $this->user?->phone,
            'customer_email' => $this->guest_email ?? $this->user?->email,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'default_next_status' => $this->status?->defaultNext()?->value,
            'default_next_label' => $this->status?->defaultNext()?->label(),
            'is_terminal' => $this->status?->isTerminal() ?? false,
            'payment_status' => $this->payment_status?->value,
            'payment_status_label' => $this->payment_status ? ucfirst($this->payment_status->value) : null,
            'payment_reference' => $this->payment_reference,
            'paid_at' => $this->paid_at?->toISOString(),
            'payment_method' => $this->payment_method?->value,
            'payment_method_label' => $this->payment_method?->label(),
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'shipping_amount' => (float) $this->shipping_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'refunded_amount' => (float) ($this->refunded_amount ?? 0),
            'refundable_remaining' => max(0, (float) $this->total - (float) ($this->refunded_amount ?? 0)),
            'coupon_code' => $this->coupon_code,
            'shipping_address' => $this->shipping_address,
            'customer_note' => $this->customer_note,
            'admin_note' => $this->admin_note,
            'items_count' => $this->whenLoaded('items', fn () => (int) $this->items->sum('quantity')),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(function ($item) {
                $image = null;
                if ($item->relationLoaded('product') && $item->product?->relationLoaded('images')) {
                    $primary = $item->product->images->firstWhere('is_primary', true)
                        ?? $item->product->images->first();
                    $image = MediaUrl::resolve($primary?->path);
                }

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_slug' => $item->relationLoaded('product') ? $item->product?->slug : null,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'variant_name' => $item->variant_name,
                    'image' => $image,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total' => (float) $item->total,
                ];
            })),
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
                'user_name' => $h->relationLoaded('user') ? ($h->user?->name ?? 'System') : 'System',
                'created_at' => $h->created_at?->toISOString(),
            ])),
            'created_at' => $this->created_at?->toISOString(),
            'customer_insights' => $this->when(isset($this->customer_insights), fn () => $this->customer_insights),
            'payment_transaction' => $this->when(isset($this->payment_transaction), fn () => $this->payment_transaction),
        ];
    }
}
