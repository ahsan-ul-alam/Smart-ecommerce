import { Link } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import ProductThumbnail from '../../Components/Catalog/ProductThumbnail';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function Wishlist({ products = [] }) {
    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Wishlist</h1>
                {products.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <p>Your wishlist is empty.</p>
                        <Link href="/shop/products" className="inline-block mt-4 text-teal-700 font-medium hover:underline">Browse products</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/shop/products/${product.slug}`}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="aspect-square overflow-hidden">
                                    <ProductThumbnail product={product} />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium line-clamp-2">{product.name}</h3>
                                    <p className="text-teal-700 font-bold mt-2">{formatPrice(product.price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
