import ProductCard from './ProductCard';

export default function RecentlyViewedGrid({ products, title = 'Recently Viewed' }) {
    if (!products?.length) return null;

    return (
        <section className="shop-container py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
