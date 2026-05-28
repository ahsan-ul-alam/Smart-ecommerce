<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function update(Request $request, Integration $integration): RedirectResponse
    {
        $request->validate([
            'is_enabled' => ['sometimes', 'boolean'],
            'is_sandbox' => ['sometimes', 'boolean'],
            'priority' => ['sometimes', 'integer', 'min:0'],
            'credentials' => ['sometimes', 'array'],
            'config' => ['sometimes', 'array'],
        ]);

        $data = $request->only(['is_enabled', 'is_sandbox', 'priority', 'config']);

        if ($request->has('credentials')) {
            $existing = $integration->credentials ?? [];
            $incoming = $request->input('credentials', []);
            // Keep existing secret values when field left blank
            foreach ($incoming as $key => $value) {
                if ($value === '' || $value === null) {
                    unset($incoming[$key]);
                }
            }
            $data['credentials'] = array_merge($existing, $incoming);
        }

        $integration->update($data);

        return back()->with('success', 'Integration updated.');
    }
}
