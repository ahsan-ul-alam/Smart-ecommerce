import { Link } from '@inertiajs/react';
import ShopLayout from '../../../Layouts/ShopLayout';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../../Components/Catalog/ProductPrice';

export default function FlashSalesIndex({ sales }) {
    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Flash Sales</h1>
                <p className="text-slate-500 mb-8">Limited-time deals — grab them before they end.</p>

                {sales.length === 0 ? (
                    <p className="text-center text-slate-400 py-16">No active flash sales right now.</p>
                ) : (
                    sales.map((sale) => (
                        <section key={sale.id} className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{sale.title}</h2>
                                    {sale.description && <p className="text-sm text-slate-500 mt-1">{sale.description}</p>}
                                </div>
                                <Link href={`/shop/flash-sales/${sale.slug}`} className="text-sm text-teal-700 font-medium hover:underline">
                                    View all →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {sale.products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/shop/products/${product.slug}`}
                                        className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="aspect-square">
                                            <ProductThumbnail product={product} />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium line-clamp-2">{product.name}</h3>
                                            <div className="mt-2">
                                                <ProductPrice product={product} size="sm" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </ShopLayout>
    );
}
