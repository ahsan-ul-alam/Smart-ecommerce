<?php

namespace App\Services\Marketing;

use App\Models\FlashSale;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FlashSaleService
{
    /** @var array<int, array<string, mixed>> */
    protected array $cache = [];

    public function hydrateCache(array $productIds): void
    {
        if (empty($productIds)) {
            return;
        }

        $rows = DB::table('flash_sale_product')
            ->join('flash_sales', 'flash_sales.id', '=', 'flash_sale_product.flash_sale_id')
            ->whereIn('flash_sale_product.product_id', $productIds)
            ->where('flash_sales.is_active', true)
            ->where('flash_sales.starts_at', '<=', now())
            ->where('flash_sales.ends_at', '>=', now())
            ->select([
                'flash_sale_product.product_id',
                'flash_sale_product.sale_price',
                'flash_sale_product.max_quantity',
                'flash_sale_product.sold_count',
                'flash_sales.id as flash_sale_id',
                'flash_sales.title',
                'flash_sales.slug',
                'flash_sales.ends_at',
            ])
            ->orderBy('flash_sale_product.sale_price')
            ->get();

        foreach ($rows as $row) {
            $productId = (int) $row->product_id;
            if (isset($this->cache[$productId])) {
                continue;
            }

            if ($row->max_quantity !== null && $row->sold_count >= $row->max_quantity) {
                continue;
            }

            $this->cache[$productId] = [
                'flash_sale_id' => $row->flash_sale_id,
                'title' => $row->title,
                'slug' => $row->slug,
                'sale_price' => (float) $row->sale_price,
                'ends_at' => $row->ends_at,
                'remaining' => $row->max_quantity !== null
                    ? max(0, (int) $row->max_quantity - (int) $row->sold_count)
                    : null,
            ];
        }
    }

    public function getForProduct(int $productId): ?array
    {
        return $this->cache[$productId] ?? null;
    }

    public function effectivePrice(Product $product): float
    {
        $sale = $this->getForProduct($product->id);

        return $sale ? $sale['sale_price'] : (float) $product->price;
    }

    public function assertCanPurchase(Product $product, int $quantity): void
    {
        $sale = $this->getForProduct($product->id);
        if (! $sale) {
            return;
        }

        if ($sale['remaining'] !== null && $quantity > $sale['remaining']) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$sale['remaining']} left at flash sale price.",
            ]);
        }
    }

    public function recordOrderSales(Order $order): void
    {
        $order->load('items');

        foreach ($order->items as $item) {
            $sale = DB::table('flash_sale_product')
                ->join('flash_sales', 'flash_sales.id', '=', 'flash_sale_product.flash_sale_id')
                ->where('flash_sale_product.product_id', $item->product_id)
                ->where('flash_sales.is_active', true)
                ->where('flash_sales.starts_at', '<=', $order->created_at)
                ->where('flash_sales.ends_at', '>=', $order->created_at)
                ->where('flash_sale_product.sale_price', $item->unit_price)
                ->select('flash_sale_product.id')
                ->first();

            if ($sale) {
                DB::table('flash_sale_product')->where('id', $sale->id)->increment('sold_count', $item->quantity);
            }
        }
    }

    public function syncProducts(FlashSale $flashSale, array $products): void
    {
        $existing = DB::table('flash_sale_product')
            ->where('flash_sale_id', $flashSale->id)
            ->pluck('sold_count', 'product_id');

        $sync = [];
        foreach ($products as $row) {
            $productId = (int) $row['product_id'];
            $sync[$productId] = [
                'sale_price' => $row['sale_price'],
                'max_quantity' => $row['max_quantity'] ?? null,
                'sold_count' => (int) ($existing[$productId] ?? 0),
            ];
        }
        $flashSale->products()->sync($sync);
    }

    public function uniqueSlug(string $title, ?int $exceptId = null): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $count = 1;

        while (FlashSale::query()->where('slug', $slug)->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))->exists()) {
            $slug = $original.'-'.$count;
            $count++;
        }

        return $slug;
    }

    public function activeSales(): Collection
    {
        return FlashSale::query()->active()->with(['products' => fn ($q) => $q->published()])->get();
    }
}
