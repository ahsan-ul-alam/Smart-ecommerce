import { Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import ProductThumbnail from '../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../Components/Catalog/ProductPrice';
import RecentlyViewedGrid from '../../Components/Shop/RecentlyViewedGrid';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

const defaultBadges = [
    ['Cash on Delivery', 'Pay when you receive your order'],
    ['Free Shipping', 'On orders over ৳2,000'],
    ['Easy Returns', 'Hassle-free return policy'],
];

function parseBadges(section) {
    try {
        const parsed = JSON.parse(section.content || '[]');
        if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
        /* use defaults */
    }
    return section.settings?.badges ?? defaultBadges;
}

function SectionRenderer({ section, featured, flashSale, flashProducts }) {
    switch (section.type) {
        case 'hero':
            return (
                <section className="bg-gradient-to-br from-teal-700 to-teal-900 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{section.title || 'Shop Smart, Pay Easy'}</h1>
                        <p className="text-teal-100 text-lg max-w-xl mx-auto mb-8">{section.subtitle || 'Cash on Delivery across Bangladesh.'}</p>
                        <Link href={section.link || '/shop/products'} className="inline-block bg-white text-teal-800 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50">
                            {section.button_text || 'Browse Products'}
                        </Link>
                    </div>
                </section>
            );
        case 'banner':
            return (
                <section className="max-w-7xl mx-auto px-6 py-6">
                    <Link href={section.link || '/shop/products'} className="block rounded-2xl overflow-hidden bg-gradient-to-r from-teal-600 to-teal-800 text-white p-8 md:p-12 hover:opacity-95">
                        <h2 className="text-2xl md:text-3xl font-bold">{section.title}</h2>
                        {section.subtitle && <p className="text-teal-100 mt-2">{section.subtitle}</p>}
                        {section.image && <img src={section.image} alt="" className="mt-4 max-h-32 object-contain" />}
                    </Link>
                </section>
            );
        case 'trust_badges': {
            const badges = parseBadges(section);
            return (
                <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {badges.map(([title, desc]) => (
                        <div key={title} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
                            <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{desc}</p>
                        </div>
                    ))}
                </section>
            );
        }
        case 'featured_products': {
            const limit = Math.min(12, Math.max(1, Number(section.settings?.limit) || 4));
            const products = (featured || []).slice(0, limit);
            if (!products.length) return null;
            return (
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{section.title || 'Featured Products'}</h2>
                        {section.link && (
                            <Link href={section.link} className="text-teal-700 font-medium text-sm hover:underline">
                                {section.button_text || 'View all →'}
                            </Link>
                        )}
                    </div>
                    {section.subtitle && <p className="text-slate-500 mb-6 -mt-4">{section.subtitle}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link key={product.id} href={`/shop/products/${product.slug}`} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg group">
                                <div className="aspect-square overflow-hidden group-hover:opacity-95"><ProductThumbnail product={product} /></div>
                                <div className="p-4">
                                    <h3 className="font-medium text-slate-800 dark:text-white line-clamp-2">{product.name}</h3>
                                    <div className="mt-2"><ProductPrice product={product} size="sm" /></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            );
        }
        case 'html':
            return (
                <section className="max-w-7xl mx-auto px-6 py-8">
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                </section>
            );
        default:
            return null;
    }
}

export default function Home({ featured = [], banners = [], flashSale = null, flashProducts = [], sections = [], vendors = [], recentlyViewed = [] }) {
    const hasHero = sections.some((s) => s.type === 'hero');
    const hasTrust = sections.some((s) => s.type === 'trust_badges');
    const hasFeaturedSection = sections.some((s) => s.type === 'featured_products');

    return (
        <ShopLayout>
            {banners.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 pt-6">
                    <div className="grid gap-4">
                        {banners.map((banner) => (
                            <Link key={banner.id} href={banner.link || '/shop/products'} className="block rounded-2xl overflow-hidden bg-gradient-to-r from-teal-600 to-teal-800 text-white p-8 md:p-12 hover:opacity-95">
                                <h2 className="text-2xl md:text-3xl font-bold">{banner.title}</h2>
                                {banner.image && <img src={banner.image} alt={banner.title} className="mt-4 max-h-32 object-contain" />}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} featured={featured} />
            ))}

            {!hasHero && (
                <section className="bg-gradient-to-br from-teal-700 to-teal-900 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop Smart, Pay Easy</h1>
                        <p className="text-teal-100 text-lg max-w-xl mx-auto mb-8">Cash on Delivery across Bangladesh. Fast delivery, trusted products.</p>
                        <Link href="/shop/products" className="inline-block bg-white text-teal-800 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50">Browse Products</Link>
                    </div>
                </section>
            )}

            {flashSale && flashProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="text-amber-500">⚡</span> {flashSale.title}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Limited time — ends {new Date(flashSale.ends_at).toLocaleDateString()}</p>
                        </div>
                        <Link href={`/shop/flash-sales/${flashSale.slug}`} className="text-teal-700 font-medium text-sm hover:underline">Shop flash sale →</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {flashProducts.map((product) => (
                            <Link key={product.id} href={`/shop/products/${product.slug}`} className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden hover:shadow-lg">
                                <div className="aspect-square overflow-hidden"><ProductThumbnail product={product} /></div>
                                <div className="p-4">
                                    <h3 className="font-medium text-slate-800 dark:text-white line-clamp-2">{product.name}</h3>
                                    <div className="mt-2"><ProductPrice product={product} size="sm" /></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {vendors.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Shop by Vendor</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {vendors.map((vendor) => (
                            <Link
                                key={vendor.id}
                                href={`/shop/vendors/${vendor.slug}`}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-teal-500 hover:shadow-md transition-all text-center"
                            >
                                {vendor.logo ? (
                                    <img src={vendor.logo} alt={vendor.name} className="w-14 h-14 mx-auto rounded-lg object-cover mb-2" />
                                ) : (
                                    <div className="w-14 h-14 mx-auto rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold mb-2">
                                        {vendor.name.charAt(0)}
                                    </div>
                                )}
                                <p className="font-medium text-slate-800 dark:text-white">{vendor.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{vendor.products_count} products</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {featured.length > 0 && !hasFeaturedSection && (
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Featured Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.map((product) => (
                            <Link key={product.id} href={`/shop/products/${product.slug}`} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg group">
                                <div className="aspect-square overflow-hidden group-hover:opacity-95"><ProductThumbnail product={product} /></div>
                                <div className="p-4">
                                    <h3 className="font-medium text-slate-800 dark:text-white line-clamp-2">{product.name}</h3>
                                    <div className="mt-2"><ProductPrice product={product} size="sm" /></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <RecentlyViewedGrid products={recentlyViewed} />

            {!hasTrust && (
                <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {defaultBadges.map(([title, desc]) => (
                        <div key={title} className="bg-white dark:bg-slate-800 rounded-xl p-6 border text-center">
                            <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{desc}</p>
                        </div>
                    ))}
                </section>
            )}
        </ShopLayout>
    );
}
