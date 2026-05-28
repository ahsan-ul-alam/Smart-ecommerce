import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import PriceRangeFilter from './PriceRangeFilter';

export default function ShopFiltersSidebar({
    categories = [],
    catalogMeta = {},
    filters = {},
    totalAll = 0,
    onApply,
    onClearPrice,
    className = '',
}) {
    const { t } = useTranslation();
    const priceMin = catalogMeta.price_min ?? 0;
    const priceMax = catalogMeta.price_max ?? 10000;
    const ratingCounts = catalogMeta.rating_counts ?? {};

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
                            <span>{t('shop.all_products')}</span>
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

            <PriceRangeFilter
                priceMin={priceMin}
                priceMax={priceMax}
                filters={filters}
                onApply={onApply}
                onClear={onClearPrice}
            />

            <div className="shop-filter-card">
                <h3 className="shop-filter-title">{t('shop.rating')}</h3>
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
                                    <span className="text-slate-600 dark:text-slate-300 ml-1">{stars} {t('shop.stars')}</span>
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
