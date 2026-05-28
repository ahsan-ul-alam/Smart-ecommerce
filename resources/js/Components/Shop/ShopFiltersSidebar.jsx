import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

const formatPrice = (n, sym) => `${sym}${Number(n).toLocaleString('en-BD')}`;

export default function ShopFiltersSidebar({
    categories = [],
    catalogMeta = {},
    filters = {},
    totalAll = 0,
    onApply,
    onClearPrice,
    className = '',
}) {
    const sym = '৳';
    const priceMin = catalogMeta.price_min ?? 0;
    const priceMax = catalogMeta.price_max ?? 10000;
    const localMin = filters.min_price != null ? Number(filters.min_price) : priceMin;
    const localMax = filters.max_price != null ? Number(filters.max_price) : priceMax;
    const ratingCounts = catalogMeta.rating_counts ?? {};
    const step = Math.max(1, Math.round((priceMax - priceMin) / 100));

    const presets = [
        { min: priceMin, max: Math.round(priceMin + (priceMax - priceMin) * 0.2) },
        { min: Math.round(priceMin + (priceMax - priceMin) * 0.2), max: Math.round(priceMin + (priceMax - priceMin) * 0.5) },
        { min: Math.round(priceMin + (priceMax - priceMin) * 0.5), max: priceMax },
    ].filter((p, i, arr) => p.max > p.min && (i === 0 || p.min !== arr[i - 1]?.max));

    return (
        <div className={clsx('space-y-4', className)}>
            <div className="shop-filter-card">
                <h3 className="shop-filter-title">Categories</h3>
                <ul className="space-y-0.5">
                    <li>
                        <Link
                            href="/shop/products"
                            className={clsx(
                                'shop-filter-link',
                                !filters.category && 'shop-filter-link-active',
                            )}
                        >
                            <span>All products</span>
                            <span className="shop-filter-count">{totalAll}</span>
                        </Link>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link
                                href={`/shop/products?category=${cat.id}`}
                                className={clsx(
                                    'shop-filter-link',
                                    String(filters.category) === String(cat.id) && 'shop-filter-link-active',
                                )}
                            >
                                <span>{cat.name}</span>
                                <span className="shop-filter-count">{cat.products_count ?? 0}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                {categories.length > 6 && (
                    <Link href="/shop/products" className="mt-3 block text-center text-xs font-semibold text-primary hover:underline">
                        View all categories
                    </Link>
                )}
            </div>

            <div className="shop-filter-card">
                <h3 className="shop-filter-title">Price range</h3>
                <p className="text-xs text-slate-500 mb-3">
                    {formatPrice(localMin, sym)} – {formatPrice(localMax, sym)}
                </p>
                <div className="space-y-3">
                    <input
                        type="range"
                        min={priceMin}
                        max={priceMax}
                        step={step}
                        value={localMin}
                        onChange={(e) => onApply({ min_price: e.target.value, max_price: String(localMax) })}
                        className="shop-range w-full"
                        aria-label="Minimum price"
                    />
                    <input
                        type="range"
                        min={priceMin}
                        max={priceMax}
                        step={step}
                        value={localMax}
                        onChange={(e) => onApply({ max_price: e.target.value, min_price: String(localMin) })}
                        className="shop-range w-full"
                        aria-label="Maximum price"
                    />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {presets.map((p) => (
                        <button
                            key={`${p.min}-${p.max}`}
                            type="button"
                            onClick={() => onApply({ min_price: p.min, max_price: p.max })}
                            className="shop-price-chip"
                        >
                            {formatPrice(p.min, sym)} – {formatPrice(p.max, sym)}
                        </button>
                    ))}
                    {(filters.min_price || filters.max_price) && (
                        <button type="button" onClick={onClearPrice} className="text-xs text-primary font-medium hover:underline">
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="shop-filter-card">
                <h3 className="shop-filter-title">Rating</h3>
                <ul className="space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                        <li key={stars}>
                            <button
                                type="button"
                                onClick={() => onApply({
                                    rating: String(filters.rating) === String(stars) ? undefined : stars,
                                })}
                                className={clsx(
                                    'shop-filter-link w-full text-left',
                                    String(filters.rating) === String(stars) && 'shop-filter-link-active',
                                )}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                                        />
                                    ))}
                                    <span className="text-slate-600 dark:text-slate-300 ml-1">{stars} stars</span>
                                </span>
                                <span className="shop-filter-count">({ratingCounts[stars] ?? 0})</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
