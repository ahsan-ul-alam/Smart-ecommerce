<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SpecialProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SpecialProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/SpecialProducts/Index', [
            'pages' => SpecialProduct::query()
                ->with('product:id,name,slug')
                ->latest()
                ->paginate(15),
            'products' => Product::query()->published()->orderBy('name')->limit(200)->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);
        SpecialProduct::query()->create($data);

        return back()->with('success', 'Special product landing created.');
    }

    public function update(Request $request, SpecialProduct $specialProduct): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $specialProduct->id);
        $specialProduct->update($data);

        return back()->with('success', 'Landing page updated.');
    }

    public function destroy(SpecialProduct $specialProduct): RedirectResponse
    {
        $specialProduct->delete();

        return back()->with('success', 'Landing page removed.');
    }

    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120'],
            'product_id' => ['required', 'exists:products,id'],
            'headline' => ['nullable', 'string', 'max:200'],
            'subheadline' => ['nullable', 'string', 'max:300'],
            'hero_image' => ['nullable', 'string', 'max:500'],
            'blocks' => ['nullable', 'array'],
            'theme' => ['nullable', 'array'],
            'is_published' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ]);

        $data['is_published'] = $data['is_published'] ?? false;

        return $data;
    }

    protected function uniqueSlug(string $base, ?int $exceptId = null): string
    {
        $slug = Str::slug($base);
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
