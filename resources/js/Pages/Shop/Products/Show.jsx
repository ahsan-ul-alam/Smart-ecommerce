import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ShoppingCart, Minus, Plus, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '../../../Layouts/ShopLayout';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../../Components/Catalog/ProductPrice';
import Button from '../../../Components/UI/Button';
import Badge from '../../../Components/UI/Badge';
import Textarea from '../../../Components/UI/Textarea';
import Select from '../../../Components/UI/Select';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function ProductShow({ product, related, reviews = [], avgRating = 0, inWishlist = false }) {
    const { auth } = usePage().props;
    const gallery = product.images?.length ? product.images : (product.image ? [{ url: product.image, id: 0 }] : []);
    const [activeImage, setActiveImage] = useState(gallery[0]?.url ?? null);
    const activeVariants = (product.variants ?? []).filter((v) => v.is_active);
    const [selectedVariantId, setSelectedVariantId] = useState(activeVariants[0]?.id ?? null);
    const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [wishlisted, setWishlisted] = useState(inWishlist);
    const reviewForm = useForm({ rating: '5', comment: '' });

    const displayPrice = selectedVariant?.price ?? product.price;
    const stockQty = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;

    const handleAdd = () => {
        setAdding(true);
        router.post('/shop/cart', {
            product_id: product.id,
            variant_id: selectedVariantId,
            quantity: qty,
        }, {
            preserveScroll: true,
            onFinish: () => setAdding(false),
        });
    };

    const toggleWishlist = () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post('/wishlist/toggle', { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => setWishlisted(!wishlisted),
        });
    };

    const submitReview = (e) => {
        e.preventDefault();
        reviewForm.post(`/shop/products/${product.id}/reviews`, { preserveScroll: true, onSuccess: () => reviewForm.reset() });
    };

    const inStock = !product.track_inventory || stockQty > 0;

    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
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
                                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImage === img.url ? 'border-teal-600' : 'border-transparent'}`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {product.is_featured && <Badge variant="info">Featured</Badge>}
                            <Badge variant={product.status === 'published' ? 'success' : 'default'}>{product.status}</Badge>
                            {product.is_low_stock && <Badge variant="warning">Low Stock</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">SKU: {product.sku}</p>
                        {product.category && <p className="text-sm text-slate-500">{product.category.name}</p>}

                        {avgRating > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-amber-500">
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{avgRating} ({reviews.length} reviews)</span>
                            </div>
                        )}

                        {activeVariants.length > 0 && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Options</label>
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

                        <div className="flex items-baseline gap-3 mt-4">
                            <span className="text-3xl font-bold text-teal-700">{formatPrice(displayPrice)}</span>
                            {product.compare_price && (
                                <span className="text-lg text-slate-400 line-through">{formatPrice(product.compare_price)}</span>
                            )}
                        </div>

                        {product.short_description && (
                            <p className="text-slate-600 dark:text-slate-300 mt-4">{product.short_description}</p>
                        )}

                        {product.track_inventory && (
                            <p className={`text-sm mt-2 ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                                {inStock ? `${stockQty} in stock` : 'Out of stock'}
                            </p>
                        )}

                        {inStock && (
                            <div className="flex items-center gap-4 mt-6 flex-wrap">
                                <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
                                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-lg">
                                        <Minus size={16} />
                                    </button>
                                    <span className="px-4 font-medium">{qty}</span>
                                    <button type="button" onClick={() => setQty(qty + 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-lg">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <Button onClick={handleAdd} loading={adding} className="flex-1 min-w-[140px]">
                                    <ShoppingCart size={18} /> Add to Cart
                                </Button>
                                <Button variant="secondary" onClick={toggleWishlist} title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
                                    <Heart size={18} className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
                                </Button>
                            </div>
                        )}

                        {product.description && (
                            <div className="mt-8 prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300">
                                <h3 className="font-semibold text-slate-800 dark:text-white">Description</h3>
                                <p className="whitespace-pre-wrap mt-2">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                <section className="mt-16">
                    <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
                    {reviews.length > 0 ? (
                        <div className="space-y-4 mb-8">
                            {reviews.map((r) => (
                                <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{r.name}</span>
                                        <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}</span>
                                    </div>
                                    {r.comment && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{r.comment}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 mb-6">No reviews yet.</p>
                    )}

                    {auth.user ? (
                        <form onSubmit={submitReview} className="bg-white dark:bg-slate-800 rounded-xl border p-6 max-w-lg space-y-4">
                            <h3 className="font-semibold">Write a Review</h3>
                            <Select
                                label="Rating"
                                value={reviewForm.data.rating}
                                onChange={(e) => reviewForm.setData('rating', e.target.value)}
                                options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` }))}
                            />
                            <Textarea label="Comment" value={reviewForm.data.comment} onChange={(e) => reviewForm.setData('comment', e.target.value)} rows={3} />
                            <Button type="submit" loading={reviewForm.processing}>Submit Review</Button>
                        </form>
                    ) : (
                        <p className="text-sm text-slate-500">
                            <Link href="/login" className="text-teal-700 hover:underline">Login</Link> to write a review.
                        </p>
                    )}
                </section>

                {related?.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-xl font-bold mb-6">Related Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {related.map((p) => (
                                <Link key={p.id} href={`/shop/products/${p.slug}`} className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden hover:shadow-md">
                                    <div className="aspect-square">
                                        <ProductThumbnail product={p} />
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-sm line-clamp-2">{p.name}</p>
                                        <div className="mt-1"><ProductPrice product={p} size="sm" /></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </ShopLayout>
    );
}
