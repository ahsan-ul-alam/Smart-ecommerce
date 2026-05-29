<?php

namespace App\Services\Builder;

use App\Models\LandingPageVersion;
use App\Models\SpecialProduct;
use App\Support\PromotionalImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class LandingPageBuilderService
{
    public function resolveSchema(SpecialProduct $page): array
    {
        if (! empty($page->schema)) {
            return $page->schema;
        }

        return $this->defaultSchema($page);
    }

    public function defaultSchema(?SpecialProduct $page = null): array
    {
        return [
            'version' => 2,
            'theme' => $page?->theme ?? [
                'primary_color' => '#0d9488',
                'secondary_color' => '#f59e0b',
                'background_style' => 'gradient',
            ],
            'roots' => [],
        ];
    }

    public function saveSchema(SpecialProduct $page, array $schema, string $type = 'manual'): LandingPageVersion
    {
        $schema['version'] = 2;
        $nextVersion = (int) LandingPageVersion::query()
            ->where('special_product_id', $page->id)
            ->max('version_number') + 1;

        $version = LandingPageVersion::query()->create([
            'special_product_id' => $page->id,
            'version_number' => $nextVersion,
            'schema' => $schema,
            'meta' => [
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
            ],
            'type' => $type,
            'user_id' => Auth::id(),
        ]);

        $page->update([
            'schema' => $schema,
            'schema_version' => 2,
        ]);

        $this->pruneAutosaves($page);

        return $version;
    }

    public function autosave(SpecialProduct $page, array $schema): LandingPageVersion
    {
        return $this->saveSchema($page, $schema, 'autosave');
    }

    public function publish(SpecialProduct $page, array $schema, ?string $scheduledAt = null): void
    {
        $this->saveSchema($page, $schema, 'publish');

        $status = $scheduledAt ? 'scheduled' : 'published';

        $page->update([
            'status' => $status,
            'is_published' => $status === 'published',
            'published_at' => $status === 'published' ? now() : $page->published_at,
            'scheduled_at' => $scheduledAt,
        ]);
    }

    public function unpublish(SpecialProduct $page): void
    {
        $page->update([
            'status' => 'draft',
            'is_published' => false,
            'scheduled_at' => null,
        ]);
    }

    public function restoreVersion(SpecialProduct $page, LandingPageVersion $version): void
    {
        $page->update([
            'schema' => $version->schema,
            'schema_version' => 2,
        ]);

        $this->saveSchema($page, $version->schema, 'restore');
    }

    /**
     * @param  array<string, UploadedFile|array<int, UploadedFile>>  $media
     */
    public function applyMedia(array $schema, array $media): array
    {
        if (empty($media)) {
            return $schema;
        }

        $walk = function (array &$nodes) use (&$walk, $media): void {
            foreach ($nodes as &$node) {
                $id = $node['id'] ?? null;
                if ($id && isset($media[$id])) {
                    $file = $media[$id];
                    if ($file instanceof UploadedFile && in_array($node['type'] ?? '', ['image', 'hero_banner', 'gallery'], true)) {
                        if (($node['type'] ?? '') === 'gallery' && is_array($file)) {
                            $images = $node['props']['images'] ?? [];
                            foreach ($file as $i => $upload) {
                                if ($upload instanceof UploadedFile) {
                                    $images[$i] = ['src' => PromotionalImage::store($upload, 'landing-pages'), 'alt' => ''];
                                }
                            }
                            $node['props']['images'] = $images;
                        } else {
                            $node['props']['src'] = PromotionalImage::store($file, 'landing-pages');
                        }
                    }
                }
                if (! empty($node['children'])) {
                    $walk($node['children']);
                }
            }
        };

        if (! empty($schema['roots'])) {
            $walk($schema['roots']);
        }

        return $schema;
    }

    protected function pruneAutosaves(SpecialProduct $page, int $keep = 20): void
    {
        $ids = LandingPageVersion::query()
            ->where('special_product_id', $page->id)
            ->where('type', 'autosave')
            ->orderByDesc('created_at')
            ->skip($keep)
            ->pluck('id');

        if ($ids->isNotEmpty()) {
            LandingPageVersion::query()->whereIn('id', $ids)->delete();
        }
    }
}
