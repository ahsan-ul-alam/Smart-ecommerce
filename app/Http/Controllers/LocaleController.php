<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $supported = config('arcommerze.supported_locales', ['en']);

        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:'.implode(',', $supported)],
        ]);

        $locale = $validated['locale'];

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        if ($request->user()) {
            $request->user()->update(['locale' => $locale]);
        }

        return back()->cookie('locale', $locale, 60 * 24 * 365);
    }
}
