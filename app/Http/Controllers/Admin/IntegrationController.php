<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\IntegrationType;
use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Services\Integrations\IntegrationManager;
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

        $data = $request->only(['is_sandbox', 'priority', 'config']);

        if ($request->has('is_enabled')) {
            $data['is_enabled'] = $request->boolean('is_enabled');
        }

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

    public function test(Integration $integration, IntegrationManager $manager): RedirectResponse
    {
        try {
            $ok = match ($integration->type) {
                IntegrationType::Payment => $manager->resolvePayment($integration->provider)->testConnection(),
                IntegrationType::Courier => $manager->resolveCourier($integration->provider)->testConnection(),
                IntegrationType::Sms => $manager->resolveSms($integration->provider)->testConnection(),
                IntegrationType::Email => $manager->resolveEmail($integration->provider)->testConnection(),
            };

            return back()->with(
                $ok ? 'success' : 'error',
                $ok ? ucfirst($integration->provider).' connection OK.' : ucfirst($integration->provider).' connection failed.'
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'Test failed: '.$e->getMessage());
        }
    }
}
