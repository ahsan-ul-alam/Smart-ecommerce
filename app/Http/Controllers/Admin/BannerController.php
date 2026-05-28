<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cms/Banners', [
            'banners' => Banner::query()->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Banner::query()->create($request->validate([
            'title' => ['required', 'string'],
            'image' => ['nullable', 'string'],
            'link' => ['nullable', 'string'],
            'position' => ['string'],
            'sort_order' => ['integer'],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'Banner created.');
    }

    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $banner->update($request->validate([
            'title' => ['required', 'string'],
            'image' => ['nullable', 'string'],
            'link' => ['nullable', 'string'],
            'position' => ['string'],
            'sort_order' => ['integer'],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'Banner updated.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $banner->delete();

        return back()->with('success', 'Banner deleted.');
    }
}
