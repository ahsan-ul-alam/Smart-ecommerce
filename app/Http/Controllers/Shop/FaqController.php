<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Shop/Faq', [
            'faqs' => Faq::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'question', 'answer']),
        ]);
    }
}
