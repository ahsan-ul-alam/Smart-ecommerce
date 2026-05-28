import { Link, router } from '@inertiajs/react';
import ShopLayout from '../../../Layouts/ShopLayout';
import Badge from '../../../Components/UI/Badge';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../../Components/Catalog/ProductPrice';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function ProductsIndex({ products, categories, filters }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/shop/products', Object.fromEntries(form), { preserveState: true });
    };

    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-56 shrink-0">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Categories</h3>
                        <div className="space-y-1">
                            <Link
                                href="/shop/products"
                                className={`block px-3 py-2 rounded-lg text-sm ${!filters.category ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                All Products
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/shop/products?category=${cat.id}`}
                                    className={`block px-3 py-2 rounded-lg text-sm ${filters.category == cat.id ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </aside>

                    <div className="flex-1">
                        <form onSubmit={search} className="mb-6">
                            <input
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Search products..."
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            />
                        </form>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.data?.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/shop/products/${product.slug}`}
                                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <ProductThumbnail product={product} />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex gap-2 mb-1">
                                            {product.is_featured && <Badge variant="info">Featured</Badge>}
                                            {product.is_low_stock && <Badge variant="warning">Low Stock</Badge>}
                                        </div>
                                        <h3 className="font-medium text-slate-800 dark:text-white">{product.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{product.category?.name}</p>
                                        <div className="mt-2"><ProductPrice product={product} size="sm" /></div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {!products.data?.length && (
                            <p className="text-center text-slate-400 py-16">No products found.</p>
                        )}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
