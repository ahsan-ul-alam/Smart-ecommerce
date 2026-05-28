<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use App\Services\Audit\AuditLogService;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(
        protected SettingService $settings,
        protected AuditLogService $audit,
    ) {}

    public function index(): Response
    {
        $branding = $this->settings->branding();

        return Inertia::render('Shop/Contact', [
            'store' => [
                'email' => $branding['store_email'],
                'phone' => $branding['store_phone'],
                'address' => $branding['store_address'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $inquiry = ContactInquiry::query()->create([
            ...$data,
            'status' => 'new',
        ]);

        $this->audit->log('contact.received', $inquiry, null, [
            'email' => $inquiry->email,
            'subject' => $inquiry->subject,
        ], $request);

        return back()->with('success', 'Thank you! We received your message and will reply soon.');
    }
}
