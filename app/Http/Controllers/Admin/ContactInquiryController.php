<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactInquiryController extends Controller
{
    public function __construct(
        protected AuditLogService $audit,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('customers.manage'), 403);

        $inquiries = ContactInquiry::query()
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->q, fn ($q, $term) => $q->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('subject', 'like', "%{$term}%");
            }))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Contact/Index', [
            'inquiries' => $inquiries,
            'filters' => $request->only(['q', 'status']),
            'stats' => [
                'new' => ContactInquiry::query()->where('status', 'new')->count(),
                'total' => ContactInquiry::query()->count(),
            ],
        ]);
    }

    public function update(Request $request, ContactInquiry $inquiry): RedirectResponse
    {
        abort_unless($request->user()->can('customers.manage'), 403);

        $data = $request->validate([
            'status' => ['required', Rule::in(['new', 'read', 'archived'])],
        ]);

        $inquiry->update([
            'status' => $data['status'],
            'read_at' => in_array($data['status'], ['read', 'archived'], true)
                ? ($inquiry->read_at ?? now())
                : null,
        ]);

        return back()->with('success', 'Inquiry updated.');
    }

    public function destroy(Request $request, ContactInquiry $inquiry): RedirectResponse
    {
        abort_unless($request->user()->can('customers.manage'), 403);

        $this->audit->log('contact.deleted', $inquiry, ['subject' => $inquiry->subject], null, $request);
        $inquiry->delete();

        return back()->with('success', 'Inquiry removed.');
    }
}
