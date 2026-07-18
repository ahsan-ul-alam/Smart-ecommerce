import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Minus, Plus, Star, Share2, Check, Truck, Banknote, RotateCcw, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import ShopLayout from '../../../Layouts/ShopLayout';
import ShopBreadcrumbs from '../../../Components/Shop/ShopBreadcrumbs';
import RelatedProductCard from '../../../Components/Shop/RelatedProductCard';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';
import Button from '../../../Components/UI/Button';
import Textarea from '../../../Components/UI/Textarea';
import Select from '../../../Components/UI/Select';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

const trustBadges = [
    { icon: Truck, title: 'Free delivery', desc: 'On orders above ৳2,000' },
    { icon: Banknote, title: 'Cash on delivery', desc: 'Pay when you receive' },
    { icon: RotateCcw, title: '7-day returns', desc: 'Easy return policy' },
    { icon: ShieldCheck, title: '100% genuine', desc: 'Authentic products' },
];

export default function ProductShow({
    product,
    related,
    recentlyViewed = [],
    reviews = [],
    ratingBreakdown = [],
    questions = [],
    avgRating = 0,
    inWishlist = false,
}) {
    const { auth } = usePage().props;
    const gallery = product.images?.length ? product.images : (product.image ? [{ url: product.image, id: 0 }] : []);
    const [activeImage, setActiveImage] = useState(gallery[0]?.url ?? null);
    const activeVariants = (product.variants ?? []).filter((v) => v.is_active);
    const [selectedVariantId, setSelectedVariantId] = useState(activeVariants[0]?.id ?? null);
    const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [buying, setBuying] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const reviewForm = useForm({ rating: '5', comment: '' });

    const displayPrice = selectedVariant?.price ?? product.price;
    const comparePrice = product.compare_price || product.original_price;
    const hasDiscount = comparePrice && Number(comparePrice) > Number(displayPrice);
    const discountPercent = hasDiscount ? Math.round((1 - displayPrice / comparePrice) * 100) : null;
    const savings = hasDiscount ? comparePrice - displayPrice : null;
    const stockQty = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
    const inStock = !product.track_inventory || stockQty > 0;
    const reviewCount = product.reviews_count ?? reviews.length;
    const rating = avgRating || product.avg_rating || 0;

    const cartPayload = {
        product_id: product.id,
        variant_id: selectedVariantId,
        quantity: qty,
    };

    const buyNowPayload = { ...cartPayload, buy_now: true };

    const handleAdd = () => {
        setAdding(true);
        router.post('/shop/cart', cartPayload, {
            preserveScroll: true,
            onFinish: () => setAdding(false),
        });
    };

    const handleBuyNow = () => {
        if (!inStock) return;
        setBuying(true);
        router.post('/shop/cart', buyNowPayload, {
            onSuccess: () => router.visit('/shop/checkout'),
            onError: (errs) => {
                const msg = Object.values(errs).flat().join(' ') || 'Could not add item to cart.';
                window.alert(msg);
            },
            onFinish: () => setBuying(false),
        });
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: product.name, url });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch {
            /* user cancelled */
        }
    };

    const submitReview = (e) => {
        e.preventDefault();
        reviewForm.post(`/shop/products/${product.id}/reviews`, { preserveScroll: true, onSuccess: () => reviewForm.reset() });
    };

    const categoryHref = product.category ? `/shop/products?category=${product.category.id}` : '/shop/products';

    return (
        <ShopLayout>
            <ShopBreadcrumbs
                items={[
                    ...(product.category ? [{ label: product.category.name, href: categoryHref }] : []),
                    { label: product.name },
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                <div className="space-y-3">
                    <div className="relative aspect-square rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-800">
                        {discountPercent && (
                            <span className="absolute left-4 top-4 z-10 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                                -{discountPercent}% OFF
                            </span>
                        )}
                        {activeImage ? (
                            <img src={activeImage} alt={product.name} className="h-full w-full object-contain p-6" />
                        ) : (
                            <ProductThumbnail product={product} size="lg" />
                        )}
                    </div>
                    {gallery.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {gallery.map((img) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImage(img.url)}
                                    className={clsx(
                                        'h-16 w-16 rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-800',
                                        activeImage === img.url ? 'border-primary' : 'border-slate-200 dark:border-slate-600',
                                    )}
                                >
                                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {[product.brand?.name, product.category?.name].filter(Boolean).join(' — ')}
                        </p>
                        <button
                            type="button"
                            onClick={handleShare}
                            className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-primary hover:text-primary transition-colors dark:border-slate-600"
                            aria-label="Share product"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                        {product.name}
                    </h1>

                    {rating > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Star size={14} className="fill-current" />
                                {Number(rating).toFixed(1)}
                            </span>
                            <span className="text-sm text-slate-500">{reviewCount} reviews</span>
                        </div>
                    )}

                    {activeVariants.length > 0 && (
                        <div className="mt-4">
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Options</label>
                            <Select
                                value={selectedVariantId ?? ''}
                                onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                                options={activeVariants.map((v) => ({
                                    value: v.id,
                                    label: `${v.name}${v.stock_quantity <= 0 ? ' (Out of stock)' : ''}`,
                                }))}
                            />
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-end gap-3">
                        <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                            {formatPrice(displayPrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-lg text-slate-400 line-through">{formatPrice(comparePrice)}</span>
                        )}
                        {savings > 0 && (
                            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                                Save {formatPrice(savings)}
                            </span>
                        )}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                        <Check size={14} className="text-emerald-500" />
                        Inclusive of all taxes
                    </p>

                    {product.track_inventory && (
                        <p className={clsx('mt-2 text-sm font-medium', inStock ? 'text-emerald-600' : 'text-red-600')}>
                            {inStock ? `${stockQty} in stock` : 'Out of stock'}
                        </p>
                    )}

                    {product.free_shipping ? (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            <Truck size={16} /> Free delivery on this product
                        </p>
                    ) : product.shipping_charge != null && (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Truck size={16} /> Delivery charge: ৳{Number(product.shipping_charge).toLocaleString('en-BD')}
                        </p>
                    )}

                    {inStock && (
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-600">
                                <button
                                    type="button"
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-l-xl"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="min-w-[2.5rem] text-center font-semibold">{qty}</span>
                                <button
                                    type="button"
                                    onClick={() => setQty(qty + 1)}
                                    className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-r-xl"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={adding}
                                className="flex-1 min-w-[140px] rounded-xl border-2 border-primary py-3 text-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-60 transition-colors"
                            >
                                {adding ? 'Adding…' : 'Add to Cart'}
                            </button>
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={buying}
                                className="flex-1 min-w-[140px] rounded-xl bg-primary py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                            >
                                {buying ? 'Processing…' : 'Buy Now'}
                            </button>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {trustBadges.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="flex items-start gap-2.5 rounded-xl bg-primary/5 p-3 dark:bg-primary/10"
                            >
                                <Icon size={18} className="shrink-0 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-white">{title}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-700">
                        <span><span className="font-semibold text-slate-700 dark:text-slate-300">SKU</span> {product.sku}</span>
                        {product.category && (
                            <span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Category</span>{' '}
                                <Link href={categoryHref} className="text-primary hover:underline">{product.category.name}</Link>
                            </span>
                        )}
                        {product.brand && (
                            <span><span className="font-semibold text-slate-700 dark:text-slate-300">Brand</span> {product.brand.name}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => setActiveTab('description')}
                        className={clsx(
                            'px-6 py-4 text-sm font-semibold transition-colors',
                            activeTab === 'description'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-slate-500 hover:text-slate-700',
                        )}
                    >
                        Description
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className={clsx(
                            'px-6 py-4 text-sm font-semibold transition-colors',
                            activeTab === 'reviews'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-slate-500 hover:text-slate-700',
                        )}
                    >
                        Reviews ({reviewCount})
                    </button>
                </div>

                <div className="p-5 sm:p-7">
                    {activeTab === 'description' && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About this product</h2>
                            {product.description ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {product.description}
                                </div>
                            ) : product.short_description ? (
                                <p className="text-slate-600 dark:text-slate-300">{product.short_description}</p>
                            ) : (
                                <p className="text-slate-500">No description available.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            {reviews.length > 0 ? (
                                <div className="space-y-4 mb-8">
                                    {reviews.map((r) => (
                                        <div key={r.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-800 dark:text-white">{r.name}</span>
                                                <span className="flex items-center gap-0.5 text-amber-500 text-sm">
                                                    <Star size={12} className="fill-current" />
                                                    {r.rating}
                                                </span>
                                            </div>
                                            {r.comment && (
                                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{r.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 mb-6">No reviews yet. Be the first to review this product.</p>
                            )}

                            {auth.user ? (
                                <form onSubmit={submitReview} className="max-w-lg space-y-4 rounded-xl border border-slate-100 p-5 dark:border-slate-700">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Write a review</h3>
                                    <Select
                                        label="Rating"
                                        value={reviewForm.data.rating}
                                        onChange={(e) => reviewForm.setData('rating', e.target.value)}
                                        options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` }))}
                                    />
                                    <Textarea
                                        label="Comment"
                                        value={reviewForm.data.comment}
                                        onChange={(e) => reviewForm.setData('comment', e.target.value)}
                                        rows={3}
                                    />
                                    <Button type="submit" loading={reviewForm.processing}>Submit review</Button>
                                </form>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    <Link href="/login" className="text-primary hover:underline">Login</Link> to write a review.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {related?.length > 0 && (
                <section className="mt-12">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">You May Also Like</h2>
                        {product.category && (
                            <Link
                                href={categoryHref}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                            >
                                See All
                                <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                        {related.map((p) => (
                            <RelatedProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </ShopLayout>
    );
}
