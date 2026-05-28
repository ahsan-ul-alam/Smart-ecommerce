<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\InventoryMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use App\Repositories\ProductRepository;
use App\Services\Modules\ModuleService;
use App\Services\Catalog\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected ProductRepository $products,
        protected ProductService $productService,
    ) {}

    public function index(Request $request): Response
    {
        $paginated = $this->products->paginate($request->only([
            'search', 'status', 'category_id', 'brand_id', 'low_stock',
        ]));

        return Inertia::render('Admin/Products/Index', [
            'products' => ProductResource::collection($paginated),
            'filters' => $request->only(['search', 'status', 'category_id', 'brand_id', 'low_stock']),
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'statuses' => ['draft', 'published', 'archived'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
            'vendors' => $this->vendorOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = $this->productService->create($request->validated());

        return redirect()
            ->route('admin.products.edit', $product)
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product = $this->products->find($product->id);

        return Inertia::render('Admin/Products/Form', [
            'product' => (new ProductResource($product))->resolve(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
            'inventoryMovements' => $product->inventoryMovements->map(fn ($m) => [
                'id' => $m->id,
                'type' => $m->type?->value,
                'type_label' => $m->type?->label(),
                'quantity' => $m->quantity,
                'stock_before' => $m->stock_before,
                'stock_after' => $m->stock_after,
                'notes' => $m->notes,
                'created_at' => $m->created_at?->toISOString(),
            ]),
            'movementTypes' => collect(InventoryMovementType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => $t->label(),
            ]),
            'vendors' => $this->vendorOptions(),
        ]);
    }

    protected function vendorOptions(): array
    {
        if (! app(ModuleService::class)->isEnabled('vendor')) {
            return [];
        }

        return Vendor::query()->where('is_active', true)->orderBy('name')->get(['id', 'name'])->all();
    }

    public function adjustInventory(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::enum(InventoryMovementType::class)],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $this->productService->adjustStock(
            $product,
            (int) $data['quantity'],
            InventoryMovementType::from($data['type']),
            $data['notes'] ?? null,
            $request->user()->id
        );

        return back()->with('success', 'Inventory updated.');
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->productService->update($product, $request->validated());

        return back()->with('success', 'Product updated successfully.');
    }

    public function syncVariants(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:100'],
            'variants.*.sku' => ['nullable', 'string', 'max:100'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock_quantity' => ['nullable', 'integer', 'min:0'],
            'variants.*.size' => ['nullable', 'string', 'max:50'],
            'variants.*.color' => ['nullable', 'string', 'max:50'],
            'variants.*.is_active' => ['nullable', 'boolean'],
        ]);

        $this->productService->syncVariants($product, $data['variants'] ?? []);

        return back()->with('success', 'Product variants saved.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->products->delete($product);

        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }

    public function duplicate(Product $product): RedirectResponse
    {
        $copy = $this->productService->duplicate($product);

        return redirect()
            ->route('admin.products.edit', $copy)
            ->with('success', 'Product duplicated.');
    }
}
