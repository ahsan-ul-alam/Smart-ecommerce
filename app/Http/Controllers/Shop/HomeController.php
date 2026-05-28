<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\Commerce\HomePageService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected HomePageService $home,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Shop/Home', $this->home->data($request));
    }
}
