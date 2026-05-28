<?php

namespace App\Http\Middleware;

use App\Services\Settings\SettingService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function __construct(
        protected SettingService $settings,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->settings->get('general', 'maintenance_mode', false)) {
            return $next($request);
        }

        if ($this->allowsAccess($request)) {
            return $next($request);
        }

        return Inertia::render('Shop/Maintenance', [
            'message' => 'We are performing scheduled maintenance. Please check back soon.',
        ])->toResponse($request)->setStatusCode(503);
    }

    protected function allowsAccess(Request $request): bool
    {
        if ($request->is('admin', 'admin/*')) {
            return true;
        }

        if ($request->is('login', 'logout', 'register', 'auth/*')) {
            return true;
        }

        if ($request->user()?->isAdmin()) {
            return true;
        }

        return false;
    }
}
