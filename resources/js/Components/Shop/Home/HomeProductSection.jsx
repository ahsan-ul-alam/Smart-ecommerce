import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import ShopSection from '../ShopSection';
import ProductCarousel, { ProductCarouselItem } from './ProductCarousel';
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
            <ProductCarousel>
                {products.map((product) => (
                    <ProductCarouselItem key={product.id}>
                        <ProductCard
                            product={product}
                            catalog
                            compact
                            showQuickView={false}
                            wishlisted={wishlistProductIds.includes(product.id)}
                        />
                    </ProductCarouselItem>
                ))}
            </ProductCarousel>
        </ShopSection>
    );
}
