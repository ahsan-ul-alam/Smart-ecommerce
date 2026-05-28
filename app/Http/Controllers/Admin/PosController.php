<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Services\Commerce\PosService;
use App\Services\Settings\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(
        protected PosService $pos,
        protected SettingService $settings,
    ) {}

    public function index(): Response
    {
        $limit = 30;

        return Inertia::render('Admin/Pos/Index', [
            'paymentMethods' => [
                ['value' => 'cod', 'label' => 'Cash'],
                ['value' => 'bkash', 'label' => 'bKash'],
                ['value' => 'nagad', 'label' => 'Nagad'],
            ],
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'products' => $this->productListPayload(null, null, $limit),
            'productLimit' => $limit,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->get('q', ''));
        $categoryId = $request->filled('category_id') ? (int) $request->get('category_id') : null;
        $limit = min(100, max(1, (int) $request->get('limit', 30)));

        return response()->json(
            $this->productListPayload($q !== '' ? $q : null, $categoryId, $limit)
        );
    }

    protected function productListPayload(?string $search, ?int $categoryId, int $limit): array
    {
        $query = Product::query()
            ->published()
            ->with(['images', 'variants' => fn ($v) => $v->where('is_active', true)])
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->orderBy('name');

        $total = (clone $query)->count();

        $products = $query->limit($limit)->get();

        return [
            'data' => ProductResource::collection($products)->resolve(),
            'total' => $total,
            'shown' => $products->count(),
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'payment_method' => ['required', 'string', 'in:cod,bkash,nagad,sslcommerz'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = $this->pos->createOrder($data, $request->user()->id);

        return redirect()
            ->route('admin.pos.receipt', $order)
            ->with('success', "POS order {$order->order_number} created.");
    }

    public function receipt(Order $order): Response
    {
        abort_unless($order->source === 'pos', 404);

        $order->load(['items', 'createdBy:id,name']);

        return Inertia::render('Admin/Pos/Receipt', [
            'order' => $order,
            'store' => $this->storeDetails(),
        ]);
    }

    protected function storeDetails(): array
    {
        $branding = $this->settings->branding();

        return [
            'name' => $branding['site_name'],
            'phone' => $branding['store_phone'],
            'address' => $branding['store_address'],
            'logo' => $branding['logo'],
        ];
    }
}
