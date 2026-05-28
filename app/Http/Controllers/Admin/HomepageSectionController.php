<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomepageSectionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cms/Homepage', [
            'sections' => HomepageSection::query()->orderBy('sort_order')->get(),
            'sectionTypes' => [
                ['value' => 'hero', 'label' => 'Hero banner'],
                ['value' => 'trust_badges', 'label' => 'Trust badges'],
                ['value' => 'featured_products', 'label' => 'Featured products'],
                ['value' => 'html', 'label' => 'HTML block'],
                ['value' => 'banner', 'label' => 'Promo banner'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        HomepageSection::query()->create($this->validated($request));

        return back()->with('success', 'Section created.');
    }

    public function update(Request $request, HomepageSection $section): RedirectResponse
    {
        $section->update($this->validated($request));

        return back()->with('success', 'Section updated.');
    }

    public function destroy(HomepageSection $section): RedirectResponse
    {
        $section->delete();

        return back()->with('success', 'Section removed.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:homepage_sections,id'],
        ]);

        foreach ($data['order'] as $index => $id) {
            HomepageSection::query()->where('id', $id)->update(['sort_order' => $index]);
        }

        return back()->with('success', 'Section order updated.');
    }

    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:hero,trust_badges,featured_products,html,banner'],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'link' => ['nullable', 'string'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        if (in_array($data['type'], ['trust_badges', 'featured_products'], true) && $request->has('settings')) {
            $data['settings'] = $request->input('settings');
        }

        if ($data['type'] === 'featured_products' && empty($data['settings'])) {
            $data['settings'] = ['limit' => 4];
        }

        return $data;
    }
}
