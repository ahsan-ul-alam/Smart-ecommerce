<?php

namespace App\Http\Controllers\Shop;

use App\Domain\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Shop/OrderTracking', [
            'workflow' => $this->workflow(),
            'prefillOrder' => $request->query('order'),
            'order' => null,
        ]);
    }

    public function lookup(Request $request): Response
    {
        $data = $request->validate([
            'order_number' => ['required', 'string', 'max:64'],
            'contact' => ['required', 'string', 'max:191'],
        ], [], [
            'contact' => 'email or phone',
        ]);

        $order = Order::query()
            ->where('order_number', trim($data['order_number']))
            ->with(['items.product.images', 'statusHistories.user', 'shipment', 'user'])
            ->first();

        // Verify the requester owns the order via the contact used at checkout,
        // so order numbers alone never expose a customer's address or phone.
        if (! $order || ! $this->contactMatches($order, $data['contact'])) {
            throw ValidationException::withMessages([
                'order_number' => 'No order matches those details. Check the order number and the email or phone used at checkout.',
            ]);
        }

        return Inertia::render('Shop/OrderTracking', [
            'workflow' => $this->workflow(),
            'prefillOrder' => $order->order_number,
            'order' => (new OrderResource($order))->resolve(),
        ]);
    }

    protected function contactMatches(Order $order, string $contact): bool
    {
        $contact = trim($contact);

        foreach (array_filter([$order->guest_email, $order->user?->email]) as $email) {
            if (strcasecmp(trim($email), $contact) === 0) {
                return true;
            }
        }

        $digits = preg_replace('/\D+/', '', $contact);
        if (strlen($digits) >= 6) {
            foreach (array_filter([$order->guest_phone, $order->user?->phone]) as $phone) {
                $pd = preg_replace('/\D+/', '', $phone);
                if ($pd !== '' && (str_ends_with($pd, $digits) || str_ends_with($digits, $pd))) {
                    return true;
                }
            }
        }

        return false;
    }

    /** @return array<int, array{value: string, label: string}> */
    protected function workflow(): array
    {
        return array_map(fn (OrderStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ], OrderStatus::workflowSteps());
    }
}
