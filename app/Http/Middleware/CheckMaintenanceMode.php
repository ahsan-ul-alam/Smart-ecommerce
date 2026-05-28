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
        if ($request->is('up', 'build/*', 'storage/*')) {
            return $next($request);
        }

        if (! $this->settings->isMaintenanceMode()) {
            return $next($request);
        }

        if ($this->allowsAccess($request)) {
            return $next($request);
        }

        $message = (string) $this->settings->get('general', 'maintenance_message', '')
            ?: 'We are performing scheduled maintenance. Please check back soon.';

        return Inertia::render('Shop/Maintenance', [
            'message' => $message,
        ])->toResponse($request)->setStatusCode(503);
    }

    protected function allowsAccess(Request $request): bool
    {
        if ($request->is('admin', 'admin/*')) {
            return true;
        }

        if ($request->is('login', 'logout', 'register', 'forgot-password', 'reset-password/*', 'otp/*', 'auth/*')) {
            return true;
        }

        return false;
    }
}
