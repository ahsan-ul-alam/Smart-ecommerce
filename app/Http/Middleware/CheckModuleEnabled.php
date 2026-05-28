<?php

namespace App\Http\Middleware;

use App\Services\Modules\ModuleService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleEnabled
{
    public function handle(Request $request, Closure $next, string $module): Response
    {
        if (! app(ModuleService::class)->isEnabled($module)) {
            abort(404, 'This module is currently disabled.');
        }

        return $next($request);
    }
}
