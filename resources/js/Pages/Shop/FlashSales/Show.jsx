import { Link } from '@inertiajs/react';
import ShopLayout from '../../../Layouts/ShopLayout';
import ShopBannerFrame from '../../../Components/Shop/ShopBannerFrame';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../../Components/Catalog/ProductPrice';

function Countdown({ endsAt }) {
    const end = new Date(endsAt);
    const diff = Math.max(0, end - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);

    return (
        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            Ends in {days}d {hours}h
        </p>
    );
}

export default function FlashSaleShow({ sale, products }) {
    return (
        <ShopLayout>
            <div className="shop-container py-8">
                <Link href="/shop/flash-sales" className="text-sm text-primary hover:underline mb-4 inline-block">← All flash sales</Link>
                {sale.image ? (
                    <ShopBannerFrame src={sale.image} alt={sale.title} variant="flash" className="rounded-2xl mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent z-[1]" />
                        <div className="relative z-[2] p-6 sm:p-8 text-white">
                            <h1 className="text-2xl sm:text-3xl font-bold">{sale.title}</h1>
                            {sale.description && <p className="mt-2 text-white/90 max-w-xl">{sale.description}</p>}
                            <div className="mt-3 text-amber-200"><Countdown endsAt={sale.ends_at} /></div>
                        </div>
                    </ShopBannerFrame>
                ) : (
                    <div className="bg-gradient-to-r from-secondary to-primary text-white rounded-2xl p-8 mb-8">
                        <h1 className="text-3xl font-bold">{sale.title}</h1>
                        {sale.description && <p className="mt-2 text-white/90">{sale.description}</p>}
                        <Countdown endsAt={sale.ends_at} />
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
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
                                {product.flash_sale?.remaining != null && (
                                    <p className="text-xs text-amber-600 mt-1">{product.flash_sale.remaining} left at sale price</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </ShopLayout>
    );
}
