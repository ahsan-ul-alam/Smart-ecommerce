<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\SpecialProduct;
use App\Services\Commerce\PaymentService;
use App\Services\Commerce\SpecialProductOrderService;
use App\Services\Geo\BangladeshLocationService;
use App\Support\MediaUrl;
use App\Services\Builder\BuilderCatalogService;
use App\Services\Builder\LandingPageBuilderService;
use Inertia\Inertia;
use Inertia\Response;

class SpecialProductController extends Controller
{
    public function __construct(
        protected PaymentService $payments,
        protected BangladeshLocationService $locations,
        protected SpecialProductOrderService $offerOrders,
        protected LandingPageBuilderService $builder,
        protected BuilderCatalogService $catalog,
    ) {}

    public function show(string $slug): Response
    {
        $page = SpecialProduct::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with(['product.images', 'product.variants'])
            ->firstOrFail();

        return $this->renderPage($page);
    }

    public function showPreview(SpecialProduct $page): Response
    {
        $page->load(['product.images', 'product.variants']);

        return $this->renderPage($page, draftPreview: true);
    }

    protected function renderPage(SpecialProduct $page, bool $draftPreview = false): Response
    {
        $product = $page->product;
        $product->loadMissing('variants');
        $activeVariants = $product->variants->where('is_active', true);
        $defaultVariant = $activeVariants->first();
        $qty = 1;

        $initialTotals = $this->offerOrders->previewTotals($product, $defaultVariant, $qty, null);

        $schema = $this->builder->resolveSchema($page);
        $catalog = $this->catalog->resolveForSchema($schema);

        return Inertia::render('Shop/SpecialProduct', [
            'page' => [
                'name' => $page->name,
                'slug' => $page->slug,
                'headline' => $page->headline,
                'subheadline' => $page->subheadline,
                'hero_image' => MediaUrl::resolve($page->hero_image),
                'schema' => $schema,
                'blocks' => $page->blocks ?? [],
                'theme' => $page->theme ?? [],
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
                'canonical_url' => $page->canonical_url,
                'og_image' => MediaUrl::resolve($page->og_image),
            ],
            'product' => (new ProductResource($product))->resolve(),
            'catalog' => $catalog,
            'checkout' => [
                'divisions' => $this->locations->divisions(),
                'paymentMethods' => $this->payments->enabledPaymentMethods(),
                'initialTotals' => $initialTotals,
            ],
            'draftPreview' => $draftPreview,
        ]);
    }
}
