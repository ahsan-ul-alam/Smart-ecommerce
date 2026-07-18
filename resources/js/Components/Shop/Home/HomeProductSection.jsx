import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import ShopSection from '../ShopSection';
import ProductCard from '../ProductCard';

export default function HomeProductSection({
    title,
    subtitle,
    viewAllHref = '/shop/products',
    products = [],
    wishlistProductIds = [],
}) {
    if (!products?.length) return null;

    return (
        <ShopSection
            title={title}
            subtitle={subtitle}
            action={
                <Link href={viewAllHref} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0">
                    View all <ArrowRight size={16} />
                </Link>
            }
        >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {products.slice(0, 6).map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        catalog
                        compact
                        showQuickView={false}
                        wishlisted={wishlistProductIds.includes(product.id)}
                    />
                ))}
            </div>
        </ShopSection>
    );
}
