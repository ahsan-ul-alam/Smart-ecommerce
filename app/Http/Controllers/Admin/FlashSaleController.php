<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use App\Services\Marketing\FlashSaleService;
use App\Support\MediaUrl;
use App\Support\PromotionalImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FlashSaleController extends Controller
{
    public function __construct(
        protected FlashSaleService $flashSales,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Admin/FlashSales/Index', [
            'bannerSizeHint' => PromotionalImage::RECOMMENDED_LABEL,
            'flashSales' => FlashSale::query()
                ->with(['products:id,name,price,sku'])
                ->withCount('products')
                ->latest()
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'slug' => $s->slug,
                    'description' => $s->description,
                    'image_url' => MediaUrl::resolve($s->image),
                    'starts_at' => $s->starts_at->format('Y-m-d\TH:i'),
                    'ends_at' => $s->ends_at->format('Y-m-d\TH:i'),
                    'is_active' => $s->is_active,
                    'is_running' => $s->isRunning(),
                    'products_count' => $s->products_count,
                    'products' => $s->products->map(fn ($p) => [
                        'product_id' => $p->id,
                        'name' => $p->name,
                        'price' => (float) $p->price,
                        'sale_price' => (float) $p->pivot->sale_price,
                        'max_quantity' => $p->pivot->max_quantity,
                        'sold_count' => $p->pivot->sold_count,
                    ]),
                ]),
            'catalogProducts' => Product::query()->published()->orderBy('name')->get(['id', 'name', 'price', 'sku']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateSale($request, requireImage: true);
        $path = PromotionalImage::store($request->file('image'), 'flash-sales');

        $sale = FlashSale::query()->create([
            'title' => $data['title'],
            'slug' => $this->flashSales->uniqueSlug($data['slug'] ?? $data['title']),
            'description' => $data['description'] ?? null,
            'image' => $path,
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->flashSales->syncProducts($sale, $data['products'] ?? []);

        return back()->with('success', 'Flash sale created.');
    }

    public function update(Request $request, FlashSale $flashSale): RedirectResponse
    {
        $data = $this->validateSale($request, $flashSale);
        $imagePath = $flashSale->image;

        if ($request->boolean('remove_image')) {
            PromotionalImage::delete($imagePath);
            $imagePath = null;
        }

        if ($request->hasFile('image')) {
            PromotionalImage::delete($imagePath);
            $imagePath = PromotionalImage::store($request->file('image'), 'flash-sales');
        }

        $flashSale->update([
            'title' => $data['title'],
            'slug' => $this->flashSales->uniqueSlug($data['slug'] ?? $data['title'], $flashSale->id),
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->flashSales->syncProducts($flashSale, $data['products'] ?? []);

        return back()->with('success', 'Flash sale updated.');
    }

    public function destroy(FlashSale $flashSale): RedirectResponse
    {
        PromotionalImage::delete($flashSale->image);
        $flashSale->delete();

        return back()->with('success', 'Flash sale deleted.');
    }

    protected function validateSale(Request $request, ?FlashSale $flashSale = null, bool $requireImage = false): array
    {
        $imageRules = $requireImage
            ? ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120']
            : ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'];

        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('flash_sales', 'slug')->ignore($flashSale)],
            'description' => ['nullable', 'string'],
            'image' => $imageRules,
            'remove_image' => ['nullable', 'boolean'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'is_active' => ['nullable', 'boolean'],
            'products' => ['nullable', 'array'],
            'products.*.product_id' => ['required', 'exists:products,id'],
            'products.*.sale_price' => ['required', 'numeric', 'min:0'],
            'products.*.max_quantity' => ['nullable', 'integer', 'min:1'],
        ]);
    }
}
