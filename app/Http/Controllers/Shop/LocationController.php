<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\Geo\BangladeshLocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function __construct(
        protected BangladeshLocationService $locations,
    ) {}

    public function divisions(): JsonResponse
    {
        return response()->json(['divisions' => $this->locations->divisions()]);
    }

    public function districts(Request $request): JsonResponse
    {
        $data = $request->validate([
            'division' => ['required', 'string', 'max:100'],
        ]);

        return response()->json([
            'districts' => $this->locations->districts($data['division']),
        ]);
    }

    public function thanas(Request $request): JsonResponse
    {
        $data = $request->validate([
            'division' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
        ]);

        return response()->json([
            'thanas' => $this->locations->thanas($data['division'], $data['district']),
        ]);
    }
}
