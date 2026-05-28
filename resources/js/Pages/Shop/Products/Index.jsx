import { Link, router } from '@inertiajs/react';
import { SlidersHorizontal } from 'lucide-react';
import ShopLayout from '../../../Layouts/ShopLayout';
import ProductCard from '../../../Components/Shop/ProductCard';
import EmptyState from '../../../Components/UI/EmptyState';
import { Package } from 'lucide-react';

export default function ProductsIndex({ products, categories, filters }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/shop/products', Object.fromEntries(form), { preserveState: true });
    };

    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Shop</h1>
                    <p className="text-slate-500 mt-1 text-sm">Browse our catalog with smart filters.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <aside className="w-full lg:w-60 shrink-0">
                        <div className="glass-panel p-4 lg:sticky lg:top-24">
                            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-800 dark:text-white">
                                <SlidersHorizontal size={16} /> Categories
                            </div>
                            <div className="space-y-0.5">
                                <Link
                                    href="/shop/products"
                                    className={`block px-3 py-2 rounded-xl text-sm font-medium transition-premium ${
                                        !filters.category ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                                    }`}
                                >
                                    All Products
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/shop/products?category=${cat.id}`}
                                        className={`block px-3 py-2 rounded-xl text-sm font-medium transition-premium ${
                                            filters.category == cat.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        <form onSubmit={search} className="mb-6">
                            <input
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Search products…"
                                className="input-premium glass w-full"
                            />
                        </form>

                        {products.data?.length ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Package}
                                title="No products found"
                                description="Try a different search or category."
                                action={<Link href="/shop/products" className="text-primary font-semibold text-sm hover:underline">Clear filters</Link>}
                            />
                        )}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
