<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AlertService;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    public function __construct(
        protected AlertService $alerts,
    ) {}

    public function index(): Response
    {
        $items = $this->alerts->build();

        return Inertia::render('Admin/Alerts/Index', [
            'alerts' => $items,
            'total' => collect($items)->sum('count'),
        ]);
    }
}
