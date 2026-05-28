<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = NotificationLog::query()
            ->when($request->channel, fn ($q, $c) => $q->where('channel', $c))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->event, fn ($q, $e) => $q->where('event', 'like', "%{$e}%"))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/NotificationLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['channel', 'status', 'event']),
            'channels' => [
                ['value' => '', 'label' => 'All channels'],
                ['value' => 'email', 'label' => 'Email'],
                ['value' => 'sms', 'label' => 'SMS'],
            ],
            'statuses' => [
                ['value' => '', 'label' => 'All statuses'],
                ['value' => 'sent', 'label' => 'Sent'],
                ['value' => 'failed', 'label' => 'Failed'],
                ['value' => 'skipped', 'label' => 'Skipped'],
            ],
        ]);
    }
}
