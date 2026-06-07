<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route('login', ['portal' => 'admin']));
        }

        if (! $user->isAdmin()) {
            return redirect()->route('account.dashboard')
                ->with('error', 'You do not have permission to access the admin panel.');
        }

        return $next($request);
    }
}
