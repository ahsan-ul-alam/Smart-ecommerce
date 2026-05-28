import { Link } from '@inertiajs/react';
import ShopSection from '../ShopSection';

export default function HomeBrands({ brands = [] }) {
    if (!brands.length) return null;

    return (
        <ShopSection title="Popular brands" subtitle="Shop from trusted names">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
                {brands.map((brand) => (
                    <Link
                        key={brand.id}
                        href={`/shop/products?brand=${brand.id}`}
                        className="snap-start shrink-0 w-32 sm:w-36 p-4 rounded-2xl glass-dark flex flex-col items-center text-center hover:border-primary/40 border border-transparent transition-colors"
                    >
                        {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="h-12 w-auto object-contain mb-2" loading="lazy" />
                        ) : (
                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold mb-2">
                                {brand.name.charAt(0)}
                            </div>
                        )}
                        <p className="text-xs font-semibold text-slate-800 dark:text-white line-clamp-2">{brand.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{brand.products_count} items</p>
                    </Link>
                ))}
            </div>
        </ShopSection>
    );
}
