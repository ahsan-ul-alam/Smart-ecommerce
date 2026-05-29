<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPageVersion;
use App\Models\Product;
use App\Models\SpecialProduct;
use App\Services\Builder\BuilderCatalogService;
use App\Services\Builder\LandingPageBuilderService;
use App\Support\MediaUrl;
use App\Http\Controllers\Shop\SpecialProductController as ShopSpecialProductController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SpecialProductController extends Controller
{
    public function __construct(
        protected LandingPageBuilderService $builder,
        protected BuilderCatalogService $catalog,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Admin/SpecialProducts/Index', [
            'pages' => SpecialProduct::query()
                ->with('product:id,name,slug')
                ->withCount('orders')
                ->latest()
                ->paginate(15),
            'products' => Product::query()->published()->orderBy('name')->limit(200)->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $page = SpecialProduct::query()->create([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['name']),
            'product_id' => $data['product_id'],
            'headline' => $data['name'],
            'subheadline' => 'Limited-time offer — order now with fast delivery.',
            'schema' => null,
            'schema_version' => 2,
            'theme' => $this->defaultTheme(),
            'status' => 'draft',
            'is_published' => false,
        ]);

        return redirect()
            ->route('admin.special-products.edit', $page)
            ->with('success', 'Landing created. Open the visual builder to customize.');
    }

    public function edit(SpecialProduct $specialProduct): Response
    {
        $specialProduct->load('product:id,name,slug,price,compare_price,stock_quantity,short_description,images');

        return Inertia::render('Admin/SpecialProducts/Edit', [
            'page' => $this->mapPage($specialProduct),
            'products' => Product::query()->published()->orderBy('name')->limit(200)->get(['id', 'name', 'slug']),
            'catalog' => $this->catalog->editorPayload(),
            'versions' => $specialProduct->versions()->limit(15)->get(['id', 'version_number', 'type', 'created_at']),
        ]);
    }

    public function preview(SpecialProduct $specialProduct): Response
    {
        return app(ShopSpecialProductController::class)->showPreview($specialProduct);
    }

    public function update(Request $request, SpecialProduct $specialProduct): RedirectResponse|JsonResponse
    {
        $data = $this->validated($request);
        $schema = $data['schema'] ?? $this->builder->resolveSchema($specialProduct);
        $schema = $this->builder->applyMedia($schema, $request->file('block_media', []));
        if (! empty($data['theme'])) {
            $schema['theme'] = array_merge($schema['theme'] ?? [], $data['theme']);
        }

        $imagePath = $specialProduct->hero_image;

        if ($request->boolean('remove_hero_image')) {
            PromotionalImage::delete($imagePath);
            $imagePath = null;
        } elseif ($request->hasFile('hero_image')) {
            PromotionalImage::delete($imagePath);
            $imagePath = PromotionalImage::store($request->file('hero_image'), 'special-products');
        } elseif ($request->hasFile('og_image')) {
            PromotionalImage::delete($specialProduct->og_image);
            $data['og_image'] = PromotionalImage::store($request->file('og_image'), 'special-products');
        }

        $specialProduct->update([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['slug'] ?? $data['name'], $specialProduct->id),
            'product_id' => $data['product_id'],
            'headline' => $data['headline'] ?? null,
            'subheadline' => $data['subheadline'] ?? null,
            'theme' => $schema['theme'] ?? $data['theme'] ?? $specialProduct->theme,
            'seo_title' => $data['seo_title'] ?? null,
            'seo_description' => $data['seo_description'] ?? null,
            'canonical_url' => $data['canonical_url'] ?? null,
            'og_image' => $data['og_image'] ?? $specialProduct->og_image,
            'hero_image' => $imagePath,
            'schema' => $schema,
            'schema_version' => 2,
            'status' => $data['status'] ?? $specialProduct->status,
            'is_published' => ($data['status'] ?? $specialProduct->status) === 'published',
            'published_at' => ($data['status'] ?? '') === 'published' ? now() : $specialProduct->published_at,
            'scheduled_at' => $data['scheduled_at'] ?? $specialProduct->scheduled_at,
        ]);

        $this->builder->saveSchema($specialProduct, $schema, 'manual');

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'saved_at' => now()->toIso8601String()]);
        }

        return back()->with('success', 'Landing page saved.');
    }

    public function updateStatus(Request $request, SpecialProduct $specialProduct): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:draft,published,scheduled'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $status = $data['status'];
        $scheduledAt = $data['scheduled_at'] ?? $specialProduct->scheduled_at;

        if ($status === 'scheduled' && ! $scheduledAt) {
            $scheduledAt = now()->addDay();
        }

        $specialProduct->update([
            'status' => $status,
            'is_published' => $status === 'published',
            'published_at' => $status === 'published'
                ? ($specialProduct->published_at ?? now())
                : ($status === 'draft' ? null : $specialProduct->published_at),
            'scheduled_at' => $status === 'scheduled' ? $scheduledAt : null,
        ]);

        return back()->with('success', 'Status updated.');
    }

    public function autosave(Request $request, SpecialProduct $specialProduct): JsonResponse
    {
        $schema = $request->input('schema');
        if (is_string($schema)) {
            $schema = json_decode($schema, true) ?? [];
        }
        if (! is_array($schema)) {
            abort(422, 'Invalid schema');
        }

        $schema = $this->builder->applyMedia($schema, $request->file('block_media', []));
        $version = $this->builder->autosave($specialProduct, $schema);

        return response()->json([
            'ok' => true,
            'version' => $version->version_number,
            'saved_at' => $version->created_at->toIso8601String(),
        ]);
    }

    public function versions(SpecialProduct $specialProduct): JsonResponse
    {
        return response()->json([
            'versions' => $specialProduct->versions()->limit(30)->get(['id', 'version_number', 'type', 'created_at']),
        ]);
    }

    public function restoreVersion(SpecialProduct $specialProduct, LandingPageVersion $version): JsonResponse
    {
        abort_unless($version->special_product_id === $specialProduct->id, 404);
        $this->builder->restoreVersion($specialProduct, $version);

        return response()->json([
            'ok' => true,
            'schema' => $version->schema,
        ]);
    }

    public function destroy(SpecialProduct $specialProduct): RedirectResponse
    {
        PromotionalImage::delete($specialProduct->hero_image);
        PromotionalImage::delete($specialProduct->og_image);
        $specialProduct->delete();

        return redirect()
            ->route('admin.special-products.index')
            ->with('success', 'Landing page removed.');
    }

    protected function validated(Request $request): array
    {
        foreach (['schema', 'theme'] as $key) {
            if ($request->has($key) && is_string($request->input($key))) {
                $request->merge([$key => json_decode($request->input($key), true) ?? []]);
            }
        }

        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120'],
            'product_id' => ['required', 'exists:products,id'],
            'headline' => ['nullable', 'string', 'max:200'],
            'subheadline' => ['nullable', 'string', 'max:300'],
            'schema' => ['nullable', 'array'],
            'theme' => ['nullable', 'array'],
            'status' => ['nullable', 'in:draft,published,scheduled'],
            'scheduled_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'canonical_url' => ['nullable', 'string', 'max:255'],
            'og_image' => ['nullable'],
            'block_media' => ['nullable', 'array'],
        ]);
    }

    protected function mapPage(SpecialProduct $page): array
    {
        $schema = $this->builder->resolveSchema($page);

        return [
            'id' => $page->id,
            'name' => $page->name,
            'slug' => $page->slug,
            'product_id' => $page->product_id,
            'product' => $page->product,
            'headline' => $page->headline,
            'subheadline' => $page->subheadline,
            'hero_image' => MediaUrl::resolve($page->hero_image),
            'schema' => $schema,
            'blocks' => $page->blocks ?? [],
            'theme' => $page->theme ?? $this->defaultTheme(),
            'status' => $page->status ?? ($page->is_published ? 'published' : 'draft'),
            'is_published' => $page->is_published,
            'published_at' => $page->published_at?->toIso8601String(),
            'scheduled_at' => $page->scheduled_at?->toIso8601String(),
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'canonical_url' => $page->canonical_url,
            'og_image' => MediaUrl::resolve($page->og_image),
            'preview_url' => $page->is_published
                ? url('/offer/'.$page->slug)
                : route('admin.special-products.preview', $page),
            'live_url' => url('/offer/'.$page->slug),
        ];
    }

    protected function defaultTheme(): array
    {
        return [
            'primary_color' => '#16a34a',
            'secondary_color' => '#f97316',
            'accent_color' => '#dc2626',
            'page_background' => '#ffffff',
            'text_color' => '#1e293b',
            'background_style' => 'plain',
        ];
    }

    protected function uniqueSlug(string $base, ?int $exceptId = null): string
    {
        $slug = Str::slug($base) ?: 'offer';
        $original = $slug;
        $i = 1;

        while (SpecialProduct::query()
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $original.'-'.$i++;
        }

        return $slug;
    }
}
