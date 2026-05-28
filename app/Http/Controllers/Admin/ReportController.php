<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Reports\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reports,
    ) {}

    public function index(Request $request): Response
    {
        $period = (int) $request->get('period', 30);
        if (! in_array($period, [7, 30, 90, 0], true)) {
            $period = 30;
        }

        return Inertia::render('Admin/Reports/Index', [
            'report' => $this->reports->getReport($period),
            'period' => $period,
            'periods' => [
                ['value' => 7, 'label' => 'Last 7 days'],
                ['value' => 30, 'label' => 'Last 30 days'],
                ['value' => 90, 'label' => 'Last 90 days'],
                ['value' => 0, 'label' => 'All time'],
            ],
        ]);
    }
}
