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
use App\Services\Audit\AuditLogService;
use App\Services\Catalog\ProductImportExportService;
use App\Services\Catalog\ProductService;
use App\Services\Modules\ModuleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductController extends Controller
{
    public function __construct(
        protected ProductRepository $products,
        protected ProductService $productService,
        protected ProductImportExportService $importExport,
        protected AuditLogService $audit,
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

    public function export(Request $request): StreamedResponse
    {
        $filename = 'products-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($request) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $this->importExport->exportHeaders());

            $this->products->query($request->only([
                'search', 'status', 'category_id', 'brand_id', 'low_stock',
            ]))->with(['category:id,name', 'brand:id,name'])->chunk(100, function ($chunk) use ($handle) {
                foreach ($chunk as $product) {
                    fputcsv($handle, $this->importExport->exportRow($product));
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function importForm(): Response
    {
        return Inertia::render('Admin/Products/Import', [
            'sampleHeaders' => $this->importExport->exportHeaders(),
        ]);
    }

    public function importTemplate(): StreamedResponse
    {
        $headers = $this->importExport->exportHeaders();
        $sample = $this->importExport->sampleImportRow();

        return response()->streamDownload(function () use ($headers, $sample) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $headers);
            fputcsv($out, $sample);
            fclose($out);
        }, 'product-import-template.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $result = $this->importExport->import($request->file('file'));

        $this->audit->log('products.imported', null, null, $result, $request);

        $message = "Import complete: {$result['created']} created, {$result['updated']} updated.";
        if (! empty($result['errors'])) {
            $message .= ' '.count($result['errors']).' row(s) had errors.';
        }

        return redirect()
            ->route('admin.products.index')
            ->with($result['errors'] ? 'error' : 'success', $message)
            ->with('import_errors', $result['errors']);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = $this->productService->create($request->validated());
        $this->audit->log('product.created', $product, null, $product->only(['name', 'sku', 'status', 'price']), $request);

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
        $before = $product->only(['name', 'sku', 'status', 'price', 'stock_quantity']);
        $this->productService->update($product, $request->validated());
        $this->audit->log('product.updated', $product, $before, $product->fresh()->only(['name', 'sku', 'status', 'price', 'stock_quantity']), $request);

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
        $this->audit->log('product.deleted', $product, $product->only(['name', 'sku']), null, request());
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
