<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function toggle(Request $request): RedirectResponse
    {
        $request->validate(['product_id' => ['required', 'exists:products,id']]);

        $existing = Wishlist::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            $existing->delete();

            return back()->with('success', 'Removed from wishlist.');
        }

        Wishlist::query()->create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return back()->with('success', 'Added to wishlist.');
    }

    public function index(Request $request)
    {
        $products = $request->user()
            ->wishlists()
            ->with('product.category')
            ->latest()
            ->get()
            ->pluck('product');

        return \Inertia\Inertia::render('Shop/Wishlist', [
            'products' => \App\Http\Resources\ProductResource::collection($products)->resolve(),
        ]);
    }
}
