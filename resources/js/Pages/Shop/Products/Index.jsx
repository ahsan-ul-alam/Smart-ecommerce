import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X } from 'lucide-react';
import ShopLayout from '../../../Layouts/ShopLayout';
import ShopCatalogHero from '../../../Components/Shop/ShopCatalogHero';
import ShopFiltersSidebar from '../../../Components/Shop/ShopFiltersSidebar';
import ShopTrustFeatures from '../../../Components/Shop/ShopTrustFeatures';
import ProductCard from '../../../Components/Shop/ProductCard';
import EmptyState from '../../../Components/UI/EmptyState';
import Pagination from '../../../Components/UI/Pagination';
import { Package } from 'lucide-react';

export default function ProductsIndex({
    products,
    categories = [],
    catalogMeta = {},
    filters = {},
    wishlistProductIds = [],
}) {
    const { t } = useTranslation();
    const [mobileFilters, setMobileFilters] = useState(false);

    const sortOptions = useMemo(() => [
        { value: '', label: t('shop.sort_newest') },
        { value: 'price_asc', label: t('shop.sort_price_asc') },
        { value: 'price_desc', label: t('shop.sort_price_desc') },
        { value: 'name', label: t('shop.sort_name') },
    ], [t]);
    const productList = products.data ?? [];
    const meta = products.meta ?? {};
    const totalAll = catalogMeta.total_products ?? 0;
    const activeCategory = categories.find((c) => String(c.id) === String(filters.category));

    const applyFilters = (patch) => {
        const params = { ...filters, ...patch };
        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === null || params[key] === '') {
                delete params[key];
            }
        });
        router.get('/shop/products', params, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        router.get('/shop/products', {}, { preserveState: true });
    };

    const clearPrice = () => {
        applyFilters({ min_price: undefined, max_price: undefined });
    };

    const hasFilters = Boolean(
        filters.search || filters.category || filters.featured || filters.sort
        || filters.min_price || filters.max_price || filters.rating,
    );

    const activeLabel = filters.featured
        ? 'Featured products'
        : activeCategory
            ? activeCategory.name
            : 'All products';

    const productCountLabel = meta.total != null
        ? `${activeLabel} (${meta.total})`
        : activeLabel;

    const sidebar = (
        <ShopFiltersSidebar
            categories={categories}
            catalogMeta={catalogMeta}
            filters={filters}
            totalAll={totalAll}
            onApply={applyFilters}
            onClearPrice={clearPrice}
        />
    );

    return (
        <ShopLayout fullWidth>
            <ShopCatalogHero
                title={filters.featured ? t('shop.featured_title') : t('shop.shop_title')}
                description={t('shop.shop_desc')}
                featured={Boolean(filters.featured)}
            />

            <div className="shop-container py-6 lg:py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                        <div className="sticky top-28">{sidebar}</div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        <div className="shop-catalog-toolbar mb-5">
                            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                                <h2 className="text-base font-bold text-slate-900 dark:text-white shrink-0">
                                    {productCountLabel}
                                </h2>
                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                                    >
                                        <X size={14} /> {t('shop.clear_all')}
                                    </button>
                                )}
                                {filters.search && (
                                    <span className="shop-filter-tag">
                                        “{filters.search}”
                                        <button type="button" onClick={() => applyFilters({ search: undefined })} aria-label="Remove search">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {(filters.min_price || filters.max_price) && (
                                    <span className="shop-filter-tag">
                                        ৳{Number(filters.min_price ?? catalogMeta.price_min ?? 0).toLocaleString('en-BD')}
                                        {' – '}
                                        ৳{Number(filters.max_price ?? catalogMeta.price_max ?? 0).toLocaleString('en-BD')}
                                        <button type="button" onClick={clearPrice} aria-label="Remove price filter">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.rating && (
                                    <span className="shop-filter-tag">
                                        {filters.rating}+ stars
                                        <button type="button" onClick={() => applyFilters({ rating: undefined })} aria-label="Remove rating">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto lg:max-w-md">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const q = new FormData(e.target).get('search');
                                        applyFilters({ search: q || undefined });
                                    }}
                                    className="flex flex-1 gap-2 min-w-0"
                                >
                                    <input
                                        name="search"
                                        defaultValue={filters.search || ''}
                                        placeholder={t('shop.search_in_catalog')}
                                        className="input-premium flex-1 min-w-0 py-2 text-sm"
                                    />
                                </form>
                                <button
                                    type="button"
                                    onClick={() => setMobileFilters(true)}
                                    className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium bg-white dark:bg-slate-800"
                                >
                                    <SlidersHorizontal size={16} /> {t('shop.filters')}
                                </button>
                                <select
                                    value={filters.sort || ''}
                                    onChange={(e) => applyFilters({ sort: e.target.value || undefined })}
                                    className="input-premium py-2 text-sm sm:min-w-[9.5rem]"
                                    aria-label="Sort products"
                                >
                                    {sortOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{t('shop.sort_by')}: {opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {productList.length ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {productList.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            compact
                                            catalog
                                            showQuickView={false}
                                            wishlisted={wishlistProductIds.includes(product.id)}
                                        />
                                    ))}
                                </div>
                                <div className="mt-8">
                                    <Pagination links={products.links} meta={meta} />
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={Package}
                                title={t('shop.no_products')}
                                description={t('shop.no_products_hint')}
                                action={
                                    <button type="button" onClick={clearFilters} className="text-primary font-semibold text-sm hover:underline">
                                        {t('shop.clear_filters')}
                                    </button>
                                }
                            />
                        )}
                    </div>
                </div>
            </div>

            <ShopTrustFeatures className="mt-4 mb-8" />

            {mobileFilters && (
                <div className="fixed inset-0 z-[55] lg:hidden">
                    <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} aria-label="Close filters" />
                    <aside className="absolute left-0 top-0 h-full w-[min(100%,22rem)] bg-slate-50 dark:bg-slate-900 shadow-2xl p-5 flex flex-col overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-bold text-slate-900 dark:text-white">{t('shop.filters')}</p>
                            <button type="button" onClick={() => setMobileFilters(false)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        {sidebar}
                    </aside>
                </div>
            )}
        </ShopLayout>
    );
}
