<?php

namespace App\Services\Commerce;

use App\Domain\Enums\IntegrationType;
use App\Domain\Enums\PaymentMethod;
use App\Domain\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Integrations\IntegrationManager;
use Illuminate\Support\Collection;

class PaymentService
{
    public function __construct(
        protected IntegrationManager $integrations,
        protected OrderService $orders,
    ) {}

    public function enabledPaymentMethods(): Collection
    {
        $online = $this->integrations->getEnabled(IntegrationType::Payment)
            ->whereIn('provider', ['bkash', 'nagad', 'sslcommerz', 'aamarpay', 'stripe', 'paypal'])
            ->pluck('provider')
            ->all();

        $methods = collect([
            ['value' => PaymentMethod::Cod->value, 'label' => PaymentMethod::Cod->label(), 'enabled' => true],
        ]);

        foreach ([
            'bkash' => 'bKash',
            'nagad' => 'Nagad',
            'sslcommerz' => 'SSLCommerz',
            'aamarpay' => 'aamarPay',
            'stripe' => 'Stripe',
            'paypal' => 'PayPal',
        ] as $key => $label) {
            if (in_array($key, $online, true)) {
                $methods->push(['value' => $key, 'label' => $label, 'enabled' => true]);
            }
        }

        return $methods->filter(fn ($m) => $m['enabled'])->values();
    }

    public function initiate(Order $order): array
    {
        $provider = $order->payment_method->value;
        $gateway = $this->integrations->resolvePayment($provider);
        $address = $order->shipping_address ?? [];

        $payload = [
            'amount' => (float) $order->total,
            'invoice_number' => $order->order_number,
            'order_number' => $order->order_number,
            'customer_phone' => $order->guest_phone ?? $address['phone'] ?? null,
            'customer_name' => $address['name'] ?? $order->guest_name ?? 'Customer',
            'customer_email' => $order->guest_email ?? $order->user?->email ?? 'customer@arcommerze.test',
            'customer_address' => $address['address_line_1'] ?? 'Dhaka',
            'customer_city' => $address['city'] ?? 'Dhaka',
            'product_name' => 'Order '.$order->order_number,
            'callback_url' => match ($provider) {
                'nagad' => route('shop.payments.nagad.callback'),
                'aamarpay' => route('shop.payments.aamarpay.success'),
                'stripe' => route('shop.payments.stripe.success'),
                'paypal' => route('shop.payments.paypal.success'),
                default => route('shop.payments.bkash.callback'),
            },
            'success_url' => match ($provider) {
                'aamarpay' => route('shop.payments.aamarpay.success'),
                'stripe' => route('shop.payments.stripe.success'),
                'paypal' => route('shop.payments.paypal.success'),
                default => route('shop.payments.sslcommerz.callback', ['status' => 'success']),
            },
            'fail_url' => match ($provider) {
                'aamarpay' => route('shop.payments.aamarpay.fail'),
                'stripe' => route('shop.payments.stripe.cancel'),
                'paypal' => route('shop.payments.paypal.cancel'),
                default => route('shop.payments.sslcommerz.callback', ['status' => 'fail']),
            },
            'cancel_url' => match ($provider) {
                'aamarpay' => route('shop.payments.aamarpay.cancel'),
                'stripe' => route('shop.payments.stripe.cancel'),
                'paypal' => route('shop.payments.paypal.cancel'),
                default => route('shop.payments.sslcommerz.callback', ['status' => 'cancel']),
            },
            'ipn_url' => route('shop.payments.sslcommerz.ipn'),
        ];

        $result = $gateway->initiatePayment($payload);

        PaymentTransaction::query()->create([
            'order_id' => $order->id,
            'provider' => $provider,
            'payment_id' => $result['payment_id'] ?? $result['tran_id'] ?? null,
            'amount' => $order->total,
            'status' => $result['status'] ?? 'initiated',
            'customer_phone' => $payload['customer_phone'],
            'request_payload' => $payload,
            'response_payload' => $result['raw'] ?? $result,
        ]);

        if (! empty($result['payment_id'])) {
            $order->update(['payment_reference' => $result['payment_id']]);
        }

        return $result;
    }

    public function completeNagad(array $params): Order
    {
        $paymentRef = $params['payment_ref_id'] ?? $params['paymentRefId'] ?? $params['payment_id'] ?? null;

        if (! $paymentRef) {
            abort(400, 'Missing Nagad payment reference');
        }

        $transaction = PaymentTransaction::query()
            ->where('provider', 'nagad')
            ->where('payment_id', $paymentRef)
            ->with('order')
            ->latest()
            ->firstOrFail();

        return $this->verifyAndFulfill($transaction, [
            'payment_id' => $paymentRef,
            'payment_ref_id' => $paymentRef,
        ]);
    }

    public function complete(string $paymentId): Order
    {
        $transaction = PaymentTransaction::query()
            ->where('payment_id', $paymentId)
            ->with('order')
            ->firstOrFail();

        return $this->verifyAndFulfill($transaction, ['payment_id' => $paymentId]);
    }

    public function completeBkash(array $params): Order
    {
        $paymentId = $params['paymentID'] ?? $params['payment_id'] ?? null;

        if (! $paymentId) {
            abort(400, 'Missing bKash payment reference');
        }

        $transaction = PaymentTransaction::query()
            ->where('payment_id', $paymentId)
            ->where('provider', 'bkash')
            ->with('order')
            ->latest()
            ->firstOrFail();

        $status = strtolower((string) ($params['status'] ?? 'success'));

        if ($status !== 'success') {
            $transaction->update([
                'status' => $status === 'cancel' ? 'cancelled' : 'failed',
                'response_payload' => $params,
            ]);
            $transaction->order->update(['payment_status' => PaymentStatus::Failed]);

            return $transaction->order->fresh();
        }

        return $this->verifyAndFulfill($transaction, [
            'payment_id' => $paymentId,
            'paymentID' => $paymentId,
        ]);
    }

    public function completeStripe(array $params): Order
    {
        $sessionId = $params['session_id'] ?? null;

        if (! $sessionId) {
            abort(400, 'Missing Stripe session reference');
        }

        $transaction = PaymentTransaction::query()
            ->where('payment_id', $sessionId)
            ->where('provider', 'stripe')
            ->with('order')
            ->latest()
            ->firstOrFail();

        return $this->verifyAndFulfill($transaction, [
            'session_id' => $sessionId,
            'payment_id' => $sessionId,
        ]);
    }

    public function completePaypal(array $params): Order
    {
        $paypalOrderId = $params['token'] ?? $params['payment_id'] ?? null;

        if (! $paypalOrderId) {
            abort(400, 'Missing PayPal order reference');
        }

        $transaction = PaymentTransaction::query()
            ->where('payment_id', $paypalOrderId)
            ->where('provider', 'paypal')
            ->with('order')
            ->latest()
            ->firstOrFail();

        return $this->verifyAndFulfill($transaction, [
            'payment_id' => $paypalOrderId,
            'token' => $paypalOrderId,
        ]);
    }

    public function completeAamarpay(array $params, string $status): Order
    {
        $tranId = $params['mer_txnid'] ?? $params['tran_id'] ?? null;

        if (! $tranId) {
            abort(400, 'Missing aamarPay transaction reference');
        }

        $order = Order::query()->where('order_number', $tranId)->firstOrFail();

        if ($status !== 'success') {
            $order->update(['payment_status' => PaymentStatus::Failed]);
            PaymentTransaction::query()
                ->where('order_id', $order->id)
                ->where('provider', 'aamarpay')
                ->latest()
                ->first()
                ?->update(['status' => 'cancelled', 'response_payload' => $params]);

            return $order;
        }

        $transaction = PaymentTransaction::query()
            ->where('order_id', $order->id)
            ->where('provider', 'aamarpay')
            ->latest()
            ->firstOrFail();

        return $this->verifyAndFulfill($transaction, [
            'tran_id' => $tranId,
            'mer_txnid' => $tranId,
        ]);
    }

    public function completeSslcommerz(array $params, string $callbackStatus): Order
    {
        $tranId = $params['tran_id'] ?? $params['tranId'] ?? null;

        if (! $tranId) {
            abort(400, 'Missing transaction reference');
        }

        $order = Order::query()->where('order_number', $tranId)->firstOrFail();

        if ($callbackStatus !== 'success') {
            $order->update(['payment_status' => PaymentStatus::Failed]);
            PaymentTransaction::query()
                ->where('order_id', $order->id)
                ->where('provider', 'sslcommerz')
                ->latest()
                ->first()
                ?->update(['status' => 'cancelled', 'response_payload' => $params]);

            return $order;
        }

        $transaction = PaymentTransaction::query()
            ->where('order_id', $order->id)
            ->where('provider', 'sslcommerz')
            ->latest()
            ->firstOrFail();

        return $this->verifyAndFulfill($transaction, [
            'val_id' => $params['val_id'] ?? null,
            'tran_id' => $tranId,
            'amount' => (float) $order->total,
        ]);
    }

    public function completeDemo(string $paymentId, ?string $provider = null): Order
    {
        $transaction = PaymentTransaction::query()
            ->when($provider, fn ($q) => $q->where('provider', $provider))
            ->where(function ($q) use ($paymentId) {
                $q->where('payment_id', $paymentId)
                    ->orWhereHas('order', fn ($oq) => $oq->where('order_number', $paymentId));
            })
            ->with('order')
            ->latest()
            ->firstOrFail();

        $transaction->update(['status' => 'completed', 'trx_id' => 'DEMO-TRX-'.time()]);
        $order = $this->orders->confirmPayment($transaction->order, $transaction->trx_id);
        \App\Events\OrderPlaced::dispatch($order);

        return $order->fresh();
    }

    public function handleSslcommerzIpn(array $params): void
    {
        if (($params['status'] ?? '') !== 'VALID' || empty($params['tran_id']) || empty($params['val_id'])) {
            return;
        }

        $order = Order::query()->where('order_number', $params['tran_id'])->first();
        if (! $order || $order->payment_status === PaymentStatus::Paid) {
            return;
        }

        $transaction = PaymentTransaction::query()
            ->where('order_id', $order->id)
            ->where('provider', 'sslcommerz')
            ->latest()
            ->first();

        if ($transaction) {
            $this->verifyAndFulfill($transaction, [
                'val_id' => $params['val_id'],
                'tran_id' => $params['tran_id'],
                'amount' => (float) $order->total,
            ]);
        }
    }

    protected function verifyAndFulfill(PaymentTransaction $transaction, array $verifyPayload): Order
    {
        $order = $transaction->order;

        if ($transaction->status === 'demo') {
            return $this->completeDemo($transaction->payment_id, $transaction->provider);
        }

        $gateway = $this->integrations->resolvePayment($transaction->provider);
        $result = $gateway->verifyPayment($verifyPayload);

        if ($result['verified'] ?? false) {
            $transaction->update([
                'status' => 'completed',
                'trx_id' => $result['trx_id'] ?? null,
                'response_payload' => array_merge(
                    (array) ($transaction->response_payload ?? []),
                    ['validation' => $result['raw'] ?? $result]
                ),
            ]);

            $order = $this->orders->confirmPayment($order, $result['trx_id'] ?? null);
            \App\Events\OrderPlaced::dispatch($order);

            return $order->fresh();
        }

        $transaction->update([
            'status' => 'failed',
            'response_payload' => array_merge(
                (array) ($transaction->response_payload ?? []),
                ['validation' => $result['raw'] ?? $result]
            ),
        ]);
        $order->update(['payment_status' => PaymentStatus::Failed]);

        return $order->fresh();
    }

    public function isOnlinePayment(string $method): bool
    {
        return in_array($method, ['bkash', 'nagad', 'sslcommerz', 'aamarpay', 'stripe', 'paypal'], true);
    }
}
