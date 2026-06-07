<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Casts\Json;
use Illuminate\Support\Facades\Crypt;

/**
 * Like encrypted:array but tolerates legacy plain JSON credentials in the database.
 */
class SafeEncryptedArray implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes): ?array
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return Json::decode(Crypt::decryptString($value));
        } catch (DecryptException) {
            $decoded = json_decode($value, true);

            return is_array($decoded) ? $decoded : null;
        }
    }

    public function set($model, string $key, $value, array $attributes): ?array
    {
        if ($value === null) {
            return [$key => null];
        }

        return [$key => Crypt::encryptString(Json::encode($value))];
    }
}
