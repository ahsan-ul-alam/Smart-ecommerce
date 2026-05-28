<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\Marketing\NewsletterService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function __construct(
        protected NewsletterService $newsletter,
    ) {}

    public function subscribe(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $this->newsletter->subscribe($data['email'], 'footer');

        return back()->with('success', 'Thanks for subscribing to our newsletter!');
    }

    public function unsubscribe(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        if ($this->newsletter->unsubscribe($data['email'])) {
            return back()->with('success', 'You have been unsubscribed.');
        }

        return back()->with('error', 'Email not found in our newsletter list.');
    }
}
