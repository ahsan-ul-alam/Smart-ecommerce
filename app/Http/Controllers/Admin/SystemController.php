<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Audit\ActivityLogService;
use App\Services\Audit\AuditLogService;
use App\Services\System\QueueMonitorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class SystemController extends Controller
{
    public function __construct(
        protected AuditLogService $audit,
        protected ActivityLogService $activity,
        protected QueueMonitorService $queues,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('settings.manage'), 403);

        return Inertia::render('Admin/Settings/System', [
            'queue' => $this->queues->stats(),
        ]);
    }

    public function clear(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('settings.manage'), 403);

        $type = $request->validate([
            'type' => ['required', 'in:cache,config,route,view,optimize'],
        ])['type'];

        match ($type) {
            'cache' => Artisan::call('cache:clear'),
            'config' => Artisan::call('config:clear'),
            'route' => Artisan::call('route:clear'),
            'view' => Artisan::call('view:clear'),
            'optimize' => Artisan::call('optimize:clear'),
        };

        $label = match ($type) {
            'cache' => 'application cache',
            'config' => 'config cache',
            'route' => 'route cache',
            'view' => 'compiled views',
            'optimize' => 'optimization cache',
        };

        $this->audit->log("system.{$type}_cleared", null, null, ['type' => $type], $request);
        $this->activity->log("Cleared {$label}", 'system', null, ['type' => $type], $request);

        return back()->with('success', ucfirst($label).' cleared successfully.');
    }
}
