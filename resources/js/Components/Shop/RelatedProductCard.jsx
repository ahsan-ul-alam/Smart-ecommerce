import { Link, router } from '@inertiajs/react';
import { Plus, Star } from 'lucide-react';
import { useState } from 'react';
import ProductThumbnail from '../Catalog/ProductThumbnail';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
};

export default function RelatedProductCard({ product }) {
    const [adding, setAdding] = useState(false);

    const comparePrice = product.compare_price || product.original_price;
    const hasSale = comparePrice && Number(comparePrice) > Number(product.price);
    const discount = hasSale ? Math.round((1 - product.price / comparePrice) * 100) : null;
    const rating = product.avg_rating ?? 0;
    const reviewCount = product.reviews_count ?? 0;
    const outOfStock = product.track_inventory && (product.stock_quantity ?? 0) <= 0;

    const quickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (outOfStock) return;
        setAdding(true);
        router.post('/shop/cart', { product_id: product.id, quantity: 1 }, {
            preserveScroll: true,
            onFinish: () => setAdding(false),
        });
    };

    return (
        <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-800">
            <Link href={`/shop/products/${product.slug}`} className="relative block aspect-square bg-slate-50 dark:bg-slate-900">
                <ProductThumbnail product={product} className="p-4 object-contain" />
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {isNewProduct(product.created_at) && (
                        <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">New</span>
                    )}
                    {discount && (
                        <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={quickAdd}
                    disabled={adding || outOfStock}
                    className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                    aria-label="Add to cart"
                >
                    <Plus size={18} strokeWidth={2.5} />
                </button>
            </Link>
            <div className="flex flex-1 flex-col p-3.5">
                {product.brand?.name && (
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{product.brand.name}</p>
                )}
                <Link
                    href={`/shop/products/${product.slug}`}
                    className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900 hover:text-primary dark:text-white"
                >
                    {product.name}
                </Link>
                {(rating > 0 || reviewCount > 0) && (
                    <div className="mt-1.5 flex items-center gap-1 text-amber-500">
                        <Star size={12} className="fill-current" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{Number(rating).toFixed(1)}</span>
                    </div>
                )}
                <p className="mt-auto pt-2 text-sm font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
        </article>
    );
}
