<?php

namespace App\Support;

class MediaUrl
{
    public static function resolve(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $path = trim($path);

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '//')) {
            return $path;
        }

        if (str_starts_with($path, '/')) {
            return $path;
        }

        $normalized = str_replace('\\', '/', $path);
        $normalized = ltrim($normalized, '/');

        if (str_starts_with($normalized, 'storage/')) {
            return '/'.$normalized;
        }

        return '/storage/'.$normalized;
    }
}
