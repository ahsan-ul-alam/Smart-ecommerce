<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboard,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Dashboard', $this->dashboard->build($request));
    }
}
