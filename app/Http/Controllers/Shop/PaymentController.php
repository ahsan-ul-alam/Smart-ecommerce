<?php

namespace App\Http\Controllers\Shop;

use App\Domain\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Services\Commerce\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $payments,
    ) {}

    public function bkashCallback(Request $request): RedirectResponse
    {
        $params = array_merge($request->query(), $request->post());

        if (empty($params['paymentID']) && empty($params['payment_id'])) {
            return redirect()->route('shop.cart')->with('error', 'Invalid payment callback.');
        }

        $order = $this->payments->completeBkash($params);
        $failed = strtolower((string) ($params['status'] ?? '')) !== 'success'
            && strtolower((string) ($params['status'] ?? '')) !== '';

        return $this->redirectAfterPayment($order, $failed);
    }

    public function bkashDemo(Request $request): RedirectResponse
    {
        $paymentId = $request->query('paymentID');
        $order = $this->payments->completeDemo($paymentId, 'bkash');

        return redirect()
            ->route('shop.orders.confirmation', $order->order_number)
            ->with('success', 'Demo payment completed. Configure real bKash credentials for live payments.');
    }

    public function sslcommerzCallback(Request $request, string $status): RedirectResponse
    {
        $params = array_merge($request->query(), $request->post());

        $order = $this->payments->completeSslcommerz($params, $status);

        return $this->redirectAfterPayment($order, $status !== 'success');
    }

    public function sslcommerzDemo(Request $request): RedirectResponse|\Illuminate\View\View
    {
        $tranId = $request->query('tran_id', $request->query('tranId'));

        if ($request->boolean('confirm')) {
            $order = $this->payments->completeDemo($tranId, 'sslcommerz');

            return redirect()
                ->route('shop.orders.confirmation', $order->order_number)
                ->with('success', 'Demo SSLCommerz payment completed. Add store credentials for live checkout.');
        }

        $order = \App\Models\Order::query()->where('order_number', $tranId)->first();

        return view('payments.sslcommerz-demo', [
            'orderNumber' => $tranId,
            'amount' => $order?->total ?? 0,
            'confirmUrl' => route('shop.payments.sslcommerz.demo', ['tran_id' => $tranId, 'confirm' => 1]),
        ]);
    }

    public function aamarpaySuccess(Request $request): RedirectResponse
    {
        $params = array_merge($request->query(), $request->post());
        $order = $this->payments->completeAamarpay($params, 'success');

        return $this->redirectAfterPayment($order);
    }

    public function aamarpayFail(Request $request): RedirectResponse
    {
        $params = array_merge($request->query(), $request->post());
        $order = $this->payments->completeAamarpay($params, 'fail');

        return $this->redirectAfterPayment($order, true);
    }

    public function aamarpayCancel(Request $request): RedirectResponse
    {
        $params = array_merge($request->query(), $request->post());
        $order = $this->payments->completeAamarpay($params, 'cancel');

        return $this->redirectAfterPayment($order, true);
    }

    public function aamarpayDemo(Request $request): RedirectResponse|\Illuminate\View\View
    {
        $tranId = $request->query('tran_id');

        if ($request->boolean('confirm')) {
            $order = $this->payments->completeDemo($tranId, 'aamarpay');

            return redirect()
                ->route('shop.orders.confirmation', $order->order_number)
                ->with('success', 'Demo aamarPay payment completed.');
        }

        $order = \App\Models\Order::query()->where('order_number', $tranId)->first();

        return view('payments.aamarpay-demo', [
            'orderNumber' => $tranId,
            'amount' => $order?->total ?? 0,
            'confirmUrl' => route('shop.payments.aamarpay.demo', ['tran_id' => $tranId, 'confirm' => 1]),
        ]);
    }

    public function sslcommerzIpn(Request $request): Response
    {
        $this->payments->handleSslcommerzIpn($request->all());

        return response('OK', 200);
    }

    public function nagadCallback(Request $request): RedirectResponse
    {
        $order = $this->payments->completeNagad($request->all());

        return $this->redirectAfterPayment($order);
    }

    public function stripeSuccess(Request $request): RedirectResponse
    {
        $order = $this->payments->completeStripe($request->all());

        return $this->redirectAfterPayment($order);
    }

    public function stripeCancel(Request $request): RedirectResponse
    {
        $sessionId = $request->query('session_id');
        if ($sessionId) {
            $transaction = \App\Models\PaymentTransaction::query()
                ->where('payment_id', $sessionId)
                ->where('provider', 'stripe')
                ->with('order')
                ->first();
            if ($transaction) {
                $transaction->update(['status' => 'cancelled']);
                $transaction->order->update(['payment_status' => PaymentStatus::Failed]);

                return $this->redirectAfterPayment($transaction->order, true);
            }
        }

        return redirect()->route('shop.cart')->with('error', 'Payment cancelled.');
    }

    public function stripeDemo(Request $request): RedirectResponse|\Illuminate\View\View
    {
        $orderNumber = $request->query('order');
        $sessionId = $request->query('session_id', 'cs_demo');

        if ($request->boolean('confirm')) {
            $transaction = \App\Models\PaymentTransaction::query()
                ->where('provider', 'stripe')
                ->whereHas('order', fn ($q) => $q->where('order_number', $orderNumber))
                ->latest()
                ->firstOrFail();
            $order = $this->payments->completeDemo($transaction->payment_id, 'stripe');

            return redirect()
                ->route('shop.orders.confirmation', $order->order_number)
                ->with('success', 'Demo Stripe payment completed.');
        }

        $order = \App\Models\Order::query()->where('order_number', $orderNumber)->first();

        return view('payments.stripe-demo', [
            'orderNumber' => $orderNumber,
            'amount' => $order?->total ?? 0,
            'confirmUrl' => route('shop.payments.stripe.demo', ['order' => $orderNumber, 'session_id' => $sessionId, 'confirm' => 1]),
        ]);
    }

    public function paypalSuccess(Request $request): RedirectResponse
    {
        $order = $this->payments->completePaypal($request->all());

        return $this->redirectAfterPayment($order);
    }

    public function paypalCancel(Request $request): RedirectResponse
    {
        $token = $request->query('token');
        if ($token) {
            $transaction = \App\Models\PaymentTransaction::query()
                ->where('payment_id', $token)
                ->where('provider', 'paypal')
                ->with('order')
                ->first();
            if ($transaction) {
                $transaction->update(['status' => 'cancelled']);
                $transaction->order->update(['payment_status' => PaymentStatus::Failed]);

                return $this->redirectAfterPayment($transaction->order, true);
            }
        }

        return redirect()->route('shop.cart')->with('error', 'Payment cancelled.');
    }

    public function paypalDemo(Request $request): RedirectResponse|\Illuminate\View\View
    {
        $orderNumber = $request->query('order');
        $token = $request->query('token', 'PAYPAL-DEMO');

        if ($request->boolean('confirm')) {
            $order = $this->payments->completeDemo($token, 'paypal');

            return redirect()
                ->route('shop.orders.confirmation', $order->order_number)
                ->with('success', 'Demo PayPal payment completed.');
        }

        $order = \App\Models\Order::query()->where('order_number', $orderNumber)->first();

        return view('payments.paypal-demo', [
            'orderNumber' => $orderNumber,
            'amount' => $order?->total ?? 0,
            'confirmUrl' => route('shop.payments.paypal.demo', ['order' => $orderNumber, 'token' => $token, 'confirm' => 1]),
        ]);
    }

    public function nagadDemo(Request $request, string $order_id): RedirectResponse
    {
        $order = $this->payments->completeDemo($order_id, 'nagad');

        return redirect()
            ->route('shop.orders.confirmation', $order->order_number)
            ->with('success', 'Demo Nagad payment completed. Add merchant keys in Admin → Integrations.');
    }

    protected function redirectAfterPayment($order, bool $forcedError = false): RedirectResponse
    {
        if (! $forcedError && $order->payment_status === PaymentStatus::Paid) {
            return redirect()
                ->route('shop.orders.confirmation', $order->order_number)
                ->with('success', 'Payment successful!');
        }

        return redirect()
            ->route('shop.orders.confirmation', $order->order_number)
            ->with('error', 'Payment could not be verified. Please contact support.');
    }
}
