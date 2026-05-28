<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('settings.manage'), 403);

        $logs = ActivityLog::query()
            ->with('user:id,name,email')
            ->when($request->log_name, fn ($q, $name) => $q->where('log_name', $name))
            ->when($request->q, fn ($q, $term) => $q->where('description', 'like', "%{$term}%"))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['log_name', 'q']),
            'logNames' => ActivityLog::query()
                ->whereNotNull('log_name')
                ->distinct()
                ->orderBy('log_name')
                ->pluck('log_name'),
        ]);
    }
}
