<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

class SpecialProductBlocks
{
    /**
     * @param  array<string, UploadedFile|array<int, UploadedFile>>  $media
     */
    public static function applyUploadedMedia(array $blocks, array $media): array
    {
        foreach ($blocks as &$block) {
            $id = $block['id'] ?? null;
            if (! $id || ! isset($media[$id])) {
                if (($block['type'] ?? '') === 'columns' && ! empty($block['cols'])) {
                    foreach ($block['cols'] as &$col) {
                        $col['blocks'] = self::applyUploadedMedia($col['blocks'] ?? [], $media);
                    }
                }

                continue;
            }

            $file = $media[$id];
            if (is_array($file)) {
                if (($block['type'] ?? '') === 'gallery') {
                    $images = $block['images'] ?? [];
                    foreach ($file as $i => $upload) {
                        if ($upload instanceof UploadedFile) {
                            if (! empty($images[$i]['src']) && ! self::isExternal($images[$i]['src'])) {
                                PromotionalImage::delete($images[$i]['src']);
                            }
                            $images[$i]['src'] = PromotionalImage::store($upload, 'special-products');
                        }
                    }
                    $block['images'] = $images;
                }
            } elseif ($file instanceof UploadedFile && in_array($block['type'] ?? '', ['image', 'banner'], true)) {
                if (! empty($block['src']) && ! self::isExternal($block['src'])) {
                    PromotionalImage::delete($block['src']);
                }
                $block['src'] = PromotionalImage::store($file, 'special-products');
            }

            if (($block['type'] ?? '') === 'columns' && ! empty($block['cols'])) {
                foreach ($block['cols'] as &$col) {
                    $col['blocks'] = self::applyUploadedMedia($col['blocks'] ?? [], $media);
                }
            }
        }

        return $blocks;
    }

    public static function resolveForDisplay(array $blocks): array
    {
        return array_map(function (array $block) {
            if (in_array($block['type'] ?? '', ['image', 'banner'], true) && ! empty($block['src'])) {
                $block['src'] = MediaUrl::resolve($block['src']);
            }
            if (($block['type'] ?? '') === 'gallery' && ! empty($block['images'])) {
                $block['images'] = array_map(function ($img) {
                    if (! empty($img['src'])) {
                        $img['src'] = MediaUrl::resolve($img['src']);
                    }

                    return $img;
                }, $block['images']);
            }
            if (($block['type'] ?? '') === 'columns' && ! empty($block['cols'])) {
                $block['cols'] = array_map(function ($col) {
                    $col['blocks'] = self::resolveForDisplay($col['blocks'] ?? []);

                    return $col;
                }, $block['cols']);
            }

            return $block;
        }, $blocks);
    }

    protected static function isExternal(string $path): bool
    {
        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://');
    }
}
