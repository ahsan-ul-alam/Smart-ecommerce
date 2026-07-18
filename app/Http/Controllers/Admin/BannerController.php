<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Support\MediaUrl;
use App\Support\PromotionalImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    /** Where a banner is shown on the homepage. */
    private const POSITIONS = [
        ['value' => 'homepage_hero', 'label' => 'Hero slider (top)'],
        ['value' => 'homepage_campaign', 'label' => 'Special offers (campaign row)'],
        ['value' => 'homepage', 'label' => 'Both hero & campaign'],
    ];

    public function index(): Response
    {
        return Inertia::render('Admin/Cms/Banners', [
            'bannerSizeHint' => PromotionalImage::RECOMMENDED_LABEL,
            'positions' => self::POSITIONS,
            'banners' => Banner::query()
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Banner $banner) => [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'link' => $banner->link,
                    'position' => $banner->position,
                    'sort_order' => $banner->sort_order,
                    'is_active' => $banner->is_active,
                    'image_url' => MediaUrl::resolve($banner->image),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'link' => ['nullable', 'string', 'max:500'],
            'position' => ['required', Rule::in(array_column(self::POSITIONS, 'value'))],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $path = PromotionalImage::store($request->file('image'), 'banners');

        Banner::query()->create([
            'title' => $data['title'],
            'image' => $path,
            'link' => $data['link'] ?? null,
            'position' => $data['position'],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Banner created.');
    }

    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'link' => ['nullable', 'string', 'max:500'],
            'position' => ['required', Rule::in(array_column(self::POSITIONS, 'value'))],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        $imagePath = $banner->image;

        if ($request->boolean('remove_image')) {
            PromotionalImage::delete($imagePath);
            $imagePath = null;
        }

        if ($request->hasFile('image')) {
            PromotionalImage::delete($imagePath);
            $imagePath = PromotionalImage::store($request->file('image'), 'banners');
        }

        if (! $imagePath) {
            return back()->withErrors(['image' => 'Banner image is required.'])->withInput();
        }

        $banner->update([
            'title' => $data['title'],
            'image' => $imagePath,
            'link' => $data['link'] ?? null,
            'position' => $data['position'],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Banner updated.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        PromotionalImage::delete($banner->image);
        $banner->delete();

        return back()->with('success', 'Banner deleted.');
    }
}
