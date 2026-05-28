import { Link, router, usePage } from '@inertiajs/react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import ProductThumbnail from '../Catalog/ProductThumbnail';
import ProductPrice from '../Catalog/ProductPrice';
import Badge from '../UI/Badge';

export default function ProductCard({ product, showQuickView = true, className }) {
    const { auth } = usePage().props;
    const [adding, setAdding] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    const discount =
        product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
            ? Math.round((1 - product.price / product.compare_at_price) * 100)
            : null;

    const rating = product.avg_rating ?? product.rating ?? 0;
    const reviewCount = product.reviews_count ?? 0;

    const addToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        router.post('/shop/cart', { product_id: product.id, quantity: 1 }, {
            preserveScroll: true,
            onFinish: () => setAdding(false),
        });
    };

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        router.post('/wishlist/toggle', { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => setWishlisted((v) => !v),
        });
    };

    return (
        <article className={clsx('group surface-card-interactive overflow-hidden flex flex-col', className)}>
            <Link href={`/shop/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
                    <ProductThumbnail product={product} />
                </div>

                {discount && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-red-500 text-white text-xs font-bold shadow-sm">
                        -{discount}%
                    </span>
                )}

                {product.is_featured && (
                    <span className="absolute top-3 right-3">
                        <Badge variant="info">Featured</Badge>
                    </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                    {showQuickView && (
                        <Link
                            href={`/shop/products/${product.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl glass text-xs font-semibold text-slate-800 dark:text-white"
                        >
                            <Eye size={14} /> Quick view
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        className={clsx(
                            'p-2 rounded-xl glass transition-colors',
                            wishlisted ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'
                        )}
                        aria-label="Wishlist"
                    >
                        <Heart size={16} className={wishlisted ? 'fill-current' : ''} />
                    </button>
                </div>
            </Link>

            <div className="p-4 flex flex-col flex-1">
                {product.category?.name && (
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{product.category.name}</p>
                )}
                <Link href={`/shop/products/${product.slug}`} className="font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                </Link>

                {(rating > 0 || reviewCount > 0) && (
                    <div className="flex items-center gap-1 mt-2 text-amber-500">
                        <Star size={14} className="fill-current" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{Number(rating).toFixed(1)}</span>
                        {reviewCount > 0 && <span className="text-xs text-slate-400">({reviewCount})</span>}
                    </div>
                )}

                <div className="mt-2">
                    <ProductPrice product={product} size="sm" />
                </div>

                <button
                    type="button"
                    onClick={addToCart}
                    disabled={adding || product.is_low_stock}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-teal-800 transition-premium disabled:opacity-60 btn-primary-glow"
                >
                    <ShoppingCart size={16} />
                    {adding ? 'Adding…' : 'Add to cart'}
                </button>
            </div>
        </article>
    );
}
