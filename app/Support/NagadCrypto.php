<?php

namespace App\Support;

class NagadCrypto
{
    public static function encrypt(string $plainText, string $publicKeyPem): string
    {
        $key = openssl_pkey_get_public(self::normalizeKey($publicKeyPem, 'PUBLIC'));
        if (! $key) {
            throw new \RuntimeException('Invalid Nagad public key.');
        }

        openssl_public_encrypt($plainText, $encrypted, $key, OPENSSL_PKCS1_PADDING);

        return base64_encode($encrypted);
    }

    public static function sign(string $plainText, string $privateKeyPem): string
    {
        $key = openssl_pkey_get_private(self::normalizeKey($privateKeyPem, 'PRIVATE'));
        if (! $key) {
            throw new \RuntimeException('Invalid Nagad private key.');
        }

        openssl_sign($plainText, $signature, $key, OPENSSL_ALGO_SHA256);

        return base64_encode($signature);
    }

    public static function decrypt(string $cipherText, string $privateKeyPem): string
    {
        $key = openssl_pkey_get_private(self::normalizeKey($privateKeyPem, 'PRIVATE'));
        if (! $key) {
            throw new \RuntimeException('Invalid Nagad private key.');
        }

        openssl_private_decrypt(base64_decode($cipherText), $decrypted, $key, OPENSSL_PKCS1_PADDING);

        return $decrypted;
    }

    public static function verify(string $plainText, string $signature, string $publicKeyPem): bool
    {
        $key = openssl_pkey_get_public(self::normalizeKey($publicKeyPem, 'PUBLIC'));
        if (! $key) {
            return false;
        }

        return openssl_verify($plainText, base64_decode($signature), $key, OPENSSL_ALGO_SHA256) === 1;
    }

    protected static function normalizeKey(string $key, string $type): string
    {
        $key = trim($key);
        if (str_contains($key, 'BEGIN')) {
            return $key;
        }

        $wrapped = trim(chunk_split($key, 64, "\n"));

        return "-----BEGIN {$type} KEY-----\n{$wrapped}\n-----END {$type} KEY-----";
    }
}
