<?php

namespace App\Services\Commerce;

use App\Domain\Enums\OrderStatus;
use App\Domain\Enums\PaymentStatus;
use App\Domain\Enums\ReturnRequestStatus;
use App\Models\Order;
use App\Models\OrderReturnRequest;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReturnRequestService
{
    public function __construct(
        protected OrderService $orders,
        protected AuditLogService $audit,
    ) {}

    public function canRequestReturn(Order $order): bool
    {
        if (! in_array($order->status, [
            OrderStatus::Delivered,
            OrderStatus::Shipped,
        ], true)) {
            return false;
        }

        if ($order->returnRequest()->exists()) {
            return false;
        }

        return true;
    }

    public function submit(
        Order $order,
        User $user,
        string $reason,
        ?string $note = null,
        string $returnType = 'refund',
        ?int $exchangeProductId = null,
    ): OrderReturnRequest {
        if ($order->user_id !== $user->id) {
            throw ValidationException::withMessages(['order' => 'Unauthorized.']);
        }

        if (! $this->canRequestReturn($order)) {
            throw ValidationException::withMessages(['order' => 'This order is not eligible for a return request.']);
        }

        if ($returnType === 'exchange' && ! $exchangeProductId) {
            throw ValidationException::withMessages(['exchange_product_id' => 'Select a product for exchange.']);
        }

        return OrderReturnRequest::query()->create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'status' => ReturnRequestStatus::Pending,
            'return_type' => $returnType,
            'exchange_product_id' => $exchangeProductId,
            'reason' => $reason,
            'customer_note' => $note,
        ]);
    }

    public function review(
        OrderReturnRequest $request,
        ReturnRequestStatus $status,
        ?string $adminNote,
        int $reviewerId,
        ?Request $httpRequest = null,
    ): OrderReturnRequest {
        if ($request->status !== ReturnRequestStatus::Pending) {
            throw ValidationException::withMessages(['status' => 'This request was already reviewed.']);
        }

        $request->update([
            'status' => $status,
            'admin_note' => $adminNote,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);

        $order = $request->order;

        if ($status === ReturnRequestStatus::Approved) {
            if ($request->return_type === 'exchange') {
                $this->orders->updateStatus(
                    $order,
                    OrderStatus::Processing,
                    'Exchange approved — replacement processing',
                    $reviewerId
                );
            } elseif ($request->partial_amount > 0) {
                $this->orders->recordPartialRefund(
                    $order,
                    (float) $request->partial_amount,
                    'Partial refund via return request',
                    $reviewerId
                );
            } elseif ($order->payment_status === PaymentStatus::Paid) {
                $this->orders->recordPartialRefund(
                    $order,
                    (float) $order->total - (float) $order->refunded_amount,
                    'Return approved — full refund',
                    $reviewerId
                );
            } else {
                $this->orders->updateStatus($order, OrderStatus::Returned, 'Return approved', $reviewerId);
            }
        }

        $this->audit->log(
            'return_request.reviewed',
            $request,
            ['status' => ReturnRequestStatus::Pending->value],
            ['status' => $status->value, 'order_id' => $order->id],
            $httpRequest
        );

        return $request->fresh(['order', 'user']);
    }
}
