import { Link, router } from '@inertiajs/react';
import ShopLayout from '../../../Layouts/ShopLayout';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../../Components/Catalog/ProductPrice';

export default function VendorShow({ vendor, products, filters }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get(`/shop/vendors/${vendor.slug}`, Object.fromEntries(form), { preserveState: true });
    };

    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
                    {vendor.logo ? (
                        <img src={vendor.logo} alt={vendor.name} className="w-20 h-20 rounded-xl object-cover border" />
                    ) : (
                        <div className="w-20 h-20 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-bold">
                            {vendor.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{vendor.name}</h1>
                        {(vendor.phone || vendor.email) && (
                            <p className="text-sm text-slate-500 mt-1">
                                {[vendor.phone, vendor.email].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        <p className="text-sm text-slate-400 mt-2">{products.meta?.total ?? products.data?.length ?? 0} products</p>
                    </div>
                </div>

                <form onSubmit={search} className="mb-6 max-w-md">
                    <input
                        name="search"
                        defaultValue={filters.search || ''}
                        placeholder="Search in this store..."
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
                                <h3 className="font-medium text-slate-800 dark:text-white">{product.name}</h3>
                                <div className="mt-2"><ProductPrice product={product} size="sm" /></div>
                            </div>
                        </Link>
                    ))}
                </div>

                {!products.data?.length && (
                    <p className="text-center text-slate-400 py-16">No products from this vendor yet.</p>
                )}
            </div>
        </ShopLayout>
    );
}
