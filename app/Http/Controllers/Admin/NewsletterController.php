<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterController extends Controller
{
    public function __construct(
        protected AuditLogService $audit,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('customers.manage'), 403);

        $subscribers = NewsletterSubscriber::query()
            ->when($request->status === 'unsubscribed', fn ($q) => $q->whereNotNull('unsubscribed_at'))
            ->when($request->status === 'active', fn ($q) => $q->active())
            ->when($request->q, fn ($q, $term) => $q->where('email', 'like', "%{$term}%"))
            ->latest('subscribed_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Newsletter/Index', [
            'subscribers' => $subscribers,
            'filters' => $request->only(['q', 'status']),
            'stats' => [
                'active' => NewsletterSubscriber::query()->active()->count(),
                'total' => NewsletterSubscriber::query()->count(),
            ],
        ]);
    }

    public function destroy(Request $request, NewsletterSubscriber $subscriber): RedirectResponse
    {
        abort_unless($request->user()->can('customers.manage'), 403);

        $email = $subscriber->email;
        $subscriber->delete();

        $this->audit->log('newsletter.deleted', null, null, ['email' => $email], $request);

        return back()->with('success', 'Subscriber removed.');
    }

    public function export(Request $request): StreamedResponse
    {
        abort_unless($request->user()->can('customers.manage'), 403);

        $filename = 'newsletter-subscribers-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($request) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['email', 'source', 'subscribed_at', 'unsubscribed_at']);

            NewsletterSubscriber::query()
                ->when($request->status === 'active', fn ($q) => $q->active())
                ->orderBy('email')
                ->chunk(200, function ($chunk) use ($handle) {
                    foreach ($chunk as $row) {
                        fputcsv($handle, [
                            $row->email,
                            $row->source,
                            $row->subscribed_at?->toDateTimeString(),
                            $row->unsubscribed_at?->toDateTimeString(),
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
