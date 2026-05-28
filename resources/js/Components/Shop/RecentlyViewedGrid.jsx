import { Link } from '@inertiajs/react';
import ProductThumbnail from '../Catalog/ProductThumbnail';
import ProductPrice from '../Catalog/ProductPrice';

export default function RecentlyViewedGrid({ products, title = 'Recently Viewed' }) {
    if (!products?.length) return null;

    return (
        <section className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/shop/products/${product.slug}`}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg group"
                    >
                        <div className="aspect-square overflow-hidden group-hover:opacity-95">
                            <ProductThumbnail product={product} />
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-slate-800 dark:text-white line-clamp-2 text-sm">{product.name}</h3>
                            <div className="mt-2"><ProductPrice product={product} size="sm" /></div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
