<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\SpecialProduct;
use Inertia\Inertia;
use Inertia\Response;

class SpecialProductController extends Controller
{
    public function show(string $slug): Response
    {
        $page = SpecialProduct::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with(['product.images', 'product.variants'])
            ->firstOrFail();

        return Inertia::render('Shop/SpecialProduct', [
            'page' => [
                'name' => $page->name,
                'slug' => $page->slug,
                'headline' => $page->headline,
                'subheadline' => $page->subheadline,
                'hero_image' => $page->hero_image,
                'blocks' => $page->blocks ?? [],
                'theme' => $page->theme ?? [],
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
            ],
            'product' => (new ProductResource($page->product))->resolve(),
        ]);
    }
}
