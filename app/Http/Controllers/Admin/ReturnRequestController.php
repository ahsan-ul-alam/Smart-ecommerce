<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\ReturnRequestStatus;
use App\Http\Controllers\Controller;
use App\Models\OrderReturnRequest;
use App\Services\Commerce\ReturnRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnRequestController extends Controller
{
    public function __construct(
        protected ReturnRequestService $returns,
    ) {}

    public function index(Request $request): Response
    {
        $requests = OrderReturnRequest::query()
            ->with(['order:id,order_number,total,status', 'user:id,name,email'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/ReturnRequests/Index', [
            'requests' => $requests,
            'filters' => $request->only(['status']),
            'statuses' => [
                ['value' => '', 'label' => 'All'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'approved', 'label' => 'Approved'],
                ['value' => 'rejected', 'label' => 'Rejected'],
            ],
        ]);
    }

    public function update(Request $request, OrderReturnRequest $returnRequest): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
            'partial_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        if (isset($data['partial_amount']) && $data['partial_amount'] > 0) {
            $returnRequest->update(['partial_amount' => $data['partial_amount']]);
        }

        $this->returns->review(
            $returnRequest,
            ReturnRequestStatus::from($data['status']),
            $data['admin_note'] ?? null,
            $request->user()->id,
            $request
        );

        return back()->with('success', 'Return request updated.');
    }
}
