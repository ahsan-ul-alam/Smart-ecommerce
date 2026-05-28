<?php

namespace App\Http\Middleware;

use App\Services\Marketing\AffiliateService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackAffiliate
{
    public function handle(Request $request, Closure $next): Response
    {
        app(AffiliateService::class)->captureFromRequest($request);

        return $next($request);
    }
}
