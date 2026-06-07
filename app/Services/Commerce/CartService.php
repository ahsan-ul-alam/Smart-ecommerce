<?php

namespace App\Services\Commerce;

use App\Domain\Enums\ProductStatus;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Marketing\CampaignService;
use App\Services\Marketing\FlashSaleService;
use App\Services\Settings\SettingService;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(
        protected SettingService $settings,
        protected FlashSaleService $flashSales,
        protected CampaignService $campaigns,
        protected ShippingZoneService $shippingZones,
    ) {}

    public function resolve(Request $request): Cart
    {
        if ($request->user()) {
            return Cart::query()->firstOrCreate(['user_id' => $request->user()->id]);
        }

        $sessionId = $request->session()->getId();

        return Cart::query()->firstOrCreate(['session_id' => $sessionId]);
    }

    public function addItem(Cart $cart, int $productId, int $quantity = 1, ?int $variantId = null): Cart
    {
        $product = Product::query()->published()->with('variants')->findOrFail($productId);
        $variant = $this->resolveVariant($product, $variantId);

        $this->flashSales->hydrateCache([$productId]);
        $this->flashSales->assertCanPurchase($product, $quantity);
        $this->assertStock($product, $variant, $quantity);

        $item = CartItem::query()->firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
        ]);

        $newQty = ($item->exists ? $item->quantity : 0) + $quantity;
        $this->assertStock($product, $variant, $newQty);

        $item->quantity = $newQty;
        $item->unit_price = $this->unitPrice($product, $variant);
        $item->save();

        return $cart->load(['items.product.category', 'items.product.brand', 'items.product.images', 'items.variant', 'coupon']);
    }

    public function updateQuantity(Cart $cart, int $itemId, int $quantity): Cart
    {
        $item = $cart->items()->with(['product.variants', 'variant'])->where('id', $itemId)->firstOrFail();

        if ($quantity <= 0) {
            $item->delete();

            return $cart->load(['items.product.images', 'items.variant', 'coupon']);
        }

        $product = $item->product;
        $variant = $item->variant;
        $this->flashSales->hydrateCache([$product->id]);
        $this->flashSales->assertCanPurchase($product, $quantity);
        $this->assertStock($product, $variant, $quantity);

        $item->update([
            'quantity' => $quantity,
            'unit_price' => $this->unitPrice($product, $variant),
        ]);

        return $cart->load(['items.product.images', 'items.variant', 'coupon']);
    }

    public function removeItem(Cart $cart, int $itemId): Cart
    {
        $cart->items()->where('id', $itemId)->delete();

        return $cart->load(['items.product.images', 'items.variant', 'coupon']);
    }

    public function applyCoupon(Cart $cart, string $code): Cart
    {
        $code = strtoupper(trim($code));

        if ($code === '') {
            throw ValidationException::withMessages(['code' => 'Please enter a coupon code.']);
        }

        $cart->loadMissing('items');

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['code' => 'Add items to your cart before applying a coupon.']);
        }

        $coupon = Coupon::query()->where('code', $code)->first();

        if (! $coupon) {
            throw ValidationException::withMessages(['code' => 'Invalid coupon code. Please check and try again.']);
        }

        if ($cart->coupon_id === $coupon->id) {
            throw ValidationException::withMessages(['code' => 'This coupon is already applied to your cart.']);
        }

        $subtotal = $cart->items->sum(fn ($item) => $item->lineTotal());

        if ($message = $coupon->validationMessage($subtotal)) {
            throw ValidationException::withMessages(['code' => $message]);
        }

        $cart->update(['coupon_id' => $coupon->id]);

        return $cart->load(['items.product.images', 'items.variant', 'coupon']);
    }

    public function removeCoupon(Cart $cart): Cart
    {
        $cart->update(['coupon_id' => null]);

        return $cart->load(['items.product.images', 'items.variant', 'coupon']);
    }

    public function calculateTotals(Cart $cart, ?string $district = null): array
    {
        $cart->loadMissing(['items.product.images', 'items.variant', 'coupon']);

        $subtotal = $cart->items->sum(fn ($item) => $item->lineTotal());

        $couponDiscount = 0;
        if ($cart->coupon) {
            $couponDiscount = $cart->coupon->calculateDiscount($subtotal);
        }

        $afterCoupon = max(0, $subtotal - $couponDiscount);
        $campaignDiscount = $this->campaigns->scheduledDiscount($afterCoupon);
        $discount = $couponDiscount + $campaignDiscount;

        $shippingResult = $this->shippingZones->calculate(
            max(0, $subtotal - $discount),
            $district,
            $cart->items->isNotEmpty()
        );

        $shipping = $shippingResult['shipping'];
        $taxable = max(0, $subtotal - $discount);
        $tax = $this->calculateTax($taxable);
        $total = max(0, $taxable + $shipping + $tax);

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'campaign_discount' => round($campaignDiscount, 2),
            'coupon_discount' => round($couponDiscount, 2),
            'loyalty_discount' => 0,
            'wallet_used' => 0,
            'shipping' => round($shipping, 2),
            'shipping_zone' => $shippingResult['zone'],
            'free_shipping_min' => $shippingResult['free_shipping_min'],
            'tax' => $tax,
            'tax_label' => $this->taxLabel(),
            'tax_rate' => $this->taxRate(),
            'total' => round($total, 2),
            'item_count' => $cart->items->sum('quantity'),
        ];
    }

    public function calculateTotalsWithRewards(Cart $cart, ?User $user, int $loyaltyPoints = 0, float $walletAmount = 0, ?string $district = null): array
    {
        $totals = $this->calculateTotals($cart, $district);

        if (! $user) {
            return $totals;
        }

        $afterCoupon = max(0, $totals['subtotal'] - $totals['discount'] + $totals['shipping'] + $totals['tax']);

        $loyalty = app(\App\Services\Customer\LoyaltyService::class);
        $wallet = app(\App\Services\Customer\WalletService::class);

        $loyaltyRedemption = $loyalty->isEnabled()
            ? $loyalty->previewRedemption($user, $loyaltyPoints, $afterCoupon)
            : ['points' => 0, 'discount' => 0.0];

        $afterLoyalty = max(0, $afterCoupon - $loyaltyRedemption['discount']);

        $walletUsed = $wallet->isEnabled()
            ? $wallet->previewUsage($user, $walletAmount, $afterLoyalty)
            : 0.0;

        $total = max(0, $afterLoyalty - $walletUsed);

        return [
            ...$totals,
            'loyalty_points' => $loyaltyRedemption['points'],
            'loyalty_discount' => $loyaltyRedemption['discount'],
            'wallet_used' => $walletUsed,
            'total' => round($total, 2),
        ];
    }

    public function refreshPrices(Cart $cart): void
    {
        $cart->loadMissing(['items.product', 'items.variant']);
        $ids = $cart->items->pluck('product_id')->all();
        $this->flashSales->hydrateCache($ids);

        foreach ($cart->items as $item) {
            $item->update(['unit_price' => $this->unitPrice($item->product, $item->variant)]);
        }
    }

    public function formatForFrontend(Cart $cart): array
    {
        $this->refreshPrices($cart);
        $totals = $this->calculateTotals($cart);

        return [
            'id' => $cart->id,
            'items' => $cart->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->product_variant_id,
                'variant_name' => $item->variant?->name,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'sku' => $item->variant?->sku ?? $item->product->sku,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'line_total' => $item->lineTotal(),
                'stock_quantity' => $this->availableStock($item->product, $item->variant),
                'track_inventory' => $item->product->track_inventory,
                'image' => MediaUrl::resolve(
                    ($item->product->relationLoaded('images')
                        ? ($item->product->images->firstWhere('is_primary', true) ?? $item->product->images->first())
                        : $item->product->primaryImage())?->path
                ),
            ])->values()->all(),
            'coupon' => $cart->coupon ? [
                'code' => $cart->coupon->code,
                'type' => $cart->coupon->type->value,
                'value' => (float) $cart->coupon->value,
            ] : null,
            'totals' => $totals,
        ];
    }

    public function mergeGuestCart(Request $request): void
    {
        if (! $request->user()) {
            return;
        }

        $sessionId = $request->session()->getId();
        $guestCart = Cart::query()->where('session_id', $sessionId)->with('items')->first();

        if (! $guestCart || $guestCart->items->isEmpty()) {
            return;
        }

        $userCart = Cart::query()->firstOrCreate(['user_id' => $request->user()->id]);

        DB::transaction(function () use ($guestCart, $userCart) {
            foreach ($guestCart->items as $item) {
                $this->addItem($userCart, $item->product_id, $item->quantity, $item->product_variant_id);
            }
            $guestCart->items()->delete();
            $guestCart->delete();
        });
    }

    protected function resolveVariant(Product $product, ?int $variantId): ?ProductVariant
    {
        $activeVariants = $product->variants->where('is_active', true);

        if ($activeVariants->isEmpty()) {
            return null;
        }

        if (! $variantId) {
            throw ValidationException::withMessages([
                'variant_id' => 'Please select a product option.',
            ]);
        }

        $variant = $activeVariants->firstWhere('id', $variantId);

        if (! $variant) {
            throw ValidationException::withMessages(['variant_id' => 'Invalid product option.']);
        }

        return $variant;
    }

    protected function unitPrice(Product $product, ?ProductVariant $variant): float
    {
        if ($variant?->price) {
            return (float) $variant->price;
        }

        return $this->flashSales->effectivePrice($product);
    }

    protected function availableStock(Product $product, ?ProductVariant $variant): int
    {
        if ($variant) {
            return (int) $variant->stock_quantity;
        }

        return (int) $product->stock_quantity;
    }

    protected function calculateTax(float $taxable): float
    {
        if (! $this->settings->getBoolean('commerce', 'tax_enabled', false)) {
            return 0.0;
        }

        $rate = $this->taxRate();

        return round($taxable * $rate / 100, 2);
    }

    protected function taxRate(): float
    {
        return max(0, (float) $this->settings->get('commerce', 'tax_rate', 0));
    }

    protected function taxLabel(): string
    {
        $label = trim((string) $this->settings->get('commerce', 'tax_label', 'VAT'));

        return $label !== '' ? $label : 'VAT';
    }

    protected function assertStock(Product $product, ?ProductVariant $variant, int $quantity): void
    {
        if (! $product->track_inventory) {
            return;
        }

        $available = $this->availableStock($product, $variant);

        if ($available < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$available} items available.",
            ]);
        }
    }
}
