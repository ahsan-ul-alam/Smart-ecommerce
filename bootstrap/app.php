<?php

use App\Http\Middleware\CheckMaintenanceMode;
use App\Http\Middleware\CheckModuleEnabled;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\TrackAffiliate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'shop/payments/sslcommerz/*',
            'shop/payments/aamarpay/*',
            'shop/payments/nagad/callback',
            'shop/payments/bkash/callback',
            'shop/payments/stripe/*',
            'shop/payments/paypal/*',
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            CheckMaintenanceMode::class,
            TrackAffiliate::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'module' => CheckModuleEnabled::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
