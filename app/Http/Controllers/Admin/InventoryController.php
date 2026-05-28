<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\InventoryMovementType;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessLowStockAlerts;
use App\Models\Product;
use App\Repositories\ProductRepository;
use App\Services\Catalog\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        protected ProductRepository $products,
        protected ProductService $productService,
    ) {}

    public function index(): Response
    {
        $products = Product::query()
            ->with(['category:id,name'])
            ->where('track_inventory', true)
            ->lowStock()
            ->orderBy('stock_quantity')
            ->paginate(20);

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products->through(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'stock_quantity' => $p->stock_quantity,
                'low_stock_threshold' => $p->low_stock_threshold,
                'category' => $p->category?->name,
            ]),
        ]);
    }

    public function restock(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99999'],
        ]);

        $this->productService->adjustStock(
            $product,
            (int) $data['quantity'],
            InventoryMovementType::In,
            'Quick restock from inventory',
            $request->user()->id
        );

        return back()->with('success', "Added {$data['quantity']} units to {$product->name}.");
    }

    public function sendLowStockAlert(): RedirectResponse
    {
        Cache::forget('arcommerze.low_stock_alert_sent');
        dispatch_sync(new ProcessLowStockAlerts);

        return back()->with('success', 'Low stock alert email sent (if products are low and alerts are enabled).');
    }
}
