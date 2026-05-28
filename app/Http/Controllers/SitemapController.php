<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\Vendor;
use App\Services\Modules\ModuleService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(ModuleService $modules): Response
    {
        $base = rtrim(config('app.url'), '/');

        $urls = [
            ['loc' => $base.'/', 'priority' => '1.0'],
            ['loc' => $base.'/shop/products', 'priority' => '0.9'],
            ['loc' => $base.'/shop/faq', 'priority' => '0.6'],
            ['loc' => $base.'/shop/flash-sales', 'priority' => '0.7'],
        ];

        Product::query()
            ->published()
            ->orderByDesc('updated_at')
            ->get(['slug', 'updated_at'])
            ->each(function (Product $product) use (&$urls, $base) {
                $urls[] = [
                    'loc' => $base.'/shop/products/'.$product->slug,
                    'lastmod' => $product->updated_at?->toAtomString(),
                    'priority' => '0.8',
                ];
            });

        Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'updated_at'])
            ->each(function (Category $category) use (&$urls, $base) {
                $urls[] = [
                    'loc' => $base.'/shop/products?category='.$category->id,
                    'lastmod' => $category->updated_at?->toAtomString(),
                    'priority' => '0.6',
                ];
            });

        Page::query()
            ->where('is_published', true)
            ->orderBy('title')
            ->get(['slug', 'updated_at'])
            ->each(function (Page $page) use (&$urls, $base) {
                $urls[] = [
                    'loc' => $base.'/pages/'.$page->slug,
                    'lastmod' => $page->updated_at?->toAtomString(),
                    'priority' => '0.5',
                ];
            });

        if ($modules->isEnabled('blog')) {
            $urls[] = ['loc' => $base.'/shop/blog', 'priority' => '0.7'];

            BlogPost::query()
                ->where('is_published', true)
                ->orderByDesc('published_at')
                ->get(['slug', 'updated_at'])
                ->each(function (BlogPost $post) use (&$urls, $base) {
                    $urls[] = [
                        'loc' => $base.'/shop/blog/'.$post->slug,
                        'lastmod' => $post->updated_at?->toAtomString(),
                        'priority' => '0.6',
                    ];
                });
        }

        if ($modules->isEnabled('vendor')) {
            Vendor::query()
                ->where('is_active', true)
                ->has('products')
                ->orderBy('name')
                ->get(['slug', 'updated_at'])
                ->each(function (Vendor $vendor) use (&$urls, $base) {
                    $urls[] = [
                        'loc' => $base.'/shop/vendors/'.$vendor->slug,
                        'lastmod' => $vendor->updated_at?->toAtomString(),
                        'priority' => '0.6',
                    ];
                });
        }

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml');
    }

    public function robots(): Response
    {
        $sitemap = rtrim(config('app.url'), '/').'/sitemap.xml';

        $content = implode("\n", [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /account',
            'Disallow: /login',
            'Disallow: /register',
            '',
            "Sitemap: {$sitemap}",
        ]);

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }
}
