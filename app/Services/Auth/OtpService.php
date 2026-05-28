<?php

namespace App\Services\Auth;

use App\Models\PhoneVerificationCode;
use App\Services\Integrations\IntegrationManager;
use App\Domain\Enums\IntegrationType;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function send(string $phone): void
    {
        $phone = $this->normalizePhone($phone);
        $code = (string) random_int(100000, 999999);

        PhoneVerificationCode::query()
            ->where('phone', $phone)
            ->whereNull('verified_at')
            ->delete();

        PhoneVerificationCode::query()->create([
            'phone' => $phone,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
        ]);

        $integration = app(IntegrationManager::class)->getEnabled(IntegrationType::Sms)->first();
        if ($integration) {
            $sms = app(IntegrationManager::class)->resolveSms($integration->provider);
            $sms->send($phone, 'Your '.config('app.name')." verification code is {$code}", []);
        }
    }

    public function verify(string $phone, string $code): bool
    {
        $phone = $this->normalizePhone($phone);
        $record = PhoneVerificationCode::query()
            ->where('phone', $phone)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $record || ! Hash::check($code, $record->code)) {
            throw ValidationException::withMessages(['code' => 'Invalid or expired verification code.']);
        }

        $record->update(['verified_at' => now()]);

        return true;
    }

    protected function normalizePhone(string $phone): string
    {
        return preg_replace('/\D+/', '', $phone) ?? $phone;
    }
}
