<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = config('arcommerze.supported_locales', ['en']);
        $locale = $this->resolveLocale($request, $supported);

        App::setLocale($locale);
        $request->session()->put('locale', $locale);

        return $next($request);
    }

    protected function resolveLocale(Request $request, array $supported): string
    {
        $candidates = [
            $request->user()?->locale,
            $request->session()->get('locale'),
            $request->cookie('locale'),
            config('arcommerze.default_locale', 'en'),
        ];

        foreach ($candidates as $locale) {
            if (is_string($locale) && in_array($locale, $supported, true)) {
                return $locale;
            }
        }

        return $supported[0] ?? 'en';
    }
}
