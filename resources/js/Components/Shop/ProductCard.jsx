import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import ProductThumbnail from '../Catalog/ProductThumbnail';
import ProductPrice from '../Catalog/ProductPrice';
import Badge from '../UI/Badge';

const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
};

export default function ProductCard({
    product,
    showQuickView = true,
    compact = false,
    catalog = false,
    className,
    wishlisted: wishlistedProp = false,
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [adding, setAdding] = useState(false);
    const [wishlisted, setWishlisted] = useState(wishlistedProp);

    const hasSale = product.on_sale
        || (product.compare_price && Number(product.compare_price) > Number(product.price))
        || (product.compare_at_price && Number(product.compare_at_price) > Number(product.price));

    const discount = hasSale && product.compare_at_price
        ? Math.round((1 - product.price / product.compare_at_price) * 100)
        : hasSale && product.compare_price
            ? Math.round((1 - product.price / product.compare_price) * 100)
            : null;

    const rating = product.avg_rating ?? 0;
    const reviewCount = product.reviews_count ?? 0;
    const showCatalogChrome = catalog || compact;
    const outOfStock = product.track_inventory && (product.stock_quantity ?? 0) <= 0;

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
        <article className={clsx(
            'group flex flex-col overflow-hidden',
            catalog ? 'shop-product-card' : 'surface-card-interactive',
            className,
        )}>
            <Link
                href={`/shop/products/${product.slug}`}
                className={clsx(
                    'relative block overflow-hidden',
                    catalog ? 'aspect-[4/5] rounded-t-2xl bg-white dark:bg-slate-800' : 'aspect-square bg-slate-100 dark:bg-slate-800',
                )}
            >
                {catalog ? (
                    <div className="absolute inset-0 p-3 sm:p-4 flex items-center justify-center">
                        <ProductThumbnail product={product} className="max-h-full max-w-full object-contain" />
                    </div>
                ) : (
                    <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
                        <ProductThumbnail product={product} />
                    </div>
                )}

                {catalog ? (
                    <div className="absolute left-2 top-2 flex flex-col gap-1 z-[1]">
                        {product.is_featured && <span className="shop-badge shop-badge-featured">Featured</span>}
                        {isNewProduct(product.created_at) && <span className="shop-badge shop-badge-new">New</span>}
                        {(hasSale || discount) && (
                            <span className="shop-badge shop-badge-sale">{discount ? `-${discount}%` : 'Sale'}</span>
                        )}
                    </div>
                ) : (
                    <>
                        {discount && (
                            <span className="absolute left-2 top-2 rounded-md bg-red-500 font-bold text-white shadow-sm px-2 py-0.5 text-xs">
                                -{discount}%
                            </span>
                        )}
                        {product.is_featured && (
                            <span className="absolute top-3 right-3">
                                <Badge variant="info">Featured</Badge>
                            </span>
                        )}
                    </>
                )}

                {catalog ? (
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        className={clsx(
                            'absolute right-2 top-2 z-[1] p-2 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-sm transition-colors',
                            wishlisted ? 'text-red-500' : 'text-slate-400 hover:text-red-500',
                        )}
                        aria-label="Wishlist"
                    >
                        <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
                    </button>
                ) : showQuickView && (
                    <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-200">
                        <Link
                            href={`/shop/products/${product.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl glass text-xs font-semibold text-slate-800 dark:text-white"
                        >
                            <Eye size={14} /> Quick view
                        </Link>
                        <button
                            type="button"
                            onClick={toggleWishlist}
                            className={clsx('p-2 rounded-xl glass transition-colors', wishlisted ? 'text-red-500' : 'text-slate-600')}
                            aria-label="Wishlist"
                        >
                            <Heart size={16} className={wishlisted ? 'fill-current' : ''} />
                        </button>
                    </div>
                )}
            </Link>

            <div className={clsx(
                'flex flex-col flex-1',
                catalog ? 'p-3 sm:p-4 rounded-b-2xl border border-t-0 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/90' : 'p-4',
            )}>
                {product.category?.name && (
                    <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                        {product.category.name}
                    </p>
                )}
                <Link
                    href={`/shop/products/${product.slug}`}
                    className="font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-primary transition-colors text-sm leading-snug"
                >
                    {product.name}
                </Link>

                {(rating > 0 || reviewCount > 0) && showCatalogChrome && (
                    <div className="flex items-center gap-1 mt-1.5 text-amber-500">
                        <Star size={13} className="fill-current shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {Number(rating).toFixed(1)}
                        </span>
                        {reviewCount > 0 && (
                            <span className="text-xs text-slate-400">({reviewCount})</span>
                        )}
                    </div>
                )}

                <div className="mt-1.5">
                    <ProductPrice product={product} size="sm" />
                </div>

                {product.track_inventory && showCatalogChrome && (
                    <p className={clsx(
                        'text-[10px] font-semibold mt-1',
                        outOfStock ? 'text-red-500' : product.is_low_stock ? 'text-amber-600' : 'text-emerald-600',
                    )}>
                        {outOfStock ? 'Out of stock' : product.is_low_stock ? 'Low stock' : 'In stock'}
                    </p>
                )}

                <button
                    type="button"
                    onClick={addToCart}
                    disabled={adding || outOfStock}
                    className={clsx(
                        'w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-premium btn-primary-glow',
                        catalog ? 'shop-add-cart-btn mt-3' : 'mt-4 gap-2 py-2.5 text-sm',
                    )}
                >
                    <ShoppingCart size={catalog ? 15 : 16} />
                    {adding ? t('home.adding') : t('shop.add_to_cart')}
                </button>
            </div>
        </article>
    );
}
