import { useTranslation } from 'react-i18next';
import ShopLayout from '../../Layouts/ShopLayout';
import HomeHeroSlider from '../../Components/Shop/Home/HomeHeroSlider';
import HomeFlashSale from '../../Components/Shop/Home/HomeFlashSale';
import HomeCategoryGrid from '../../Components/Shop/Home/HomeCategoryGrid';
import HomeProductSection from '../../Components/Shop/Home/HomeProductSection';
import HomeCampaignBanners from '../../Components/Shop/Home/HomeCampaignBanners';
import HomeBrands from '../../Components/Shop/Home/HomeBrands';
import HomeReviews from '../../Components/Shop/Home/HomeReviews';
import HomeTrustSection from '../../Components/Shop/Home/HomeTrustSection';
import HomeNewsletter from '../../Components/Shop/Home/HomeNewsletter';

export default function Home({
    heroSlides = [],
    campaignBanners = [],
    categories = [],
    featured = [],
    flashSale = null,
    flashProducts = [],
    trending = [],
    bestSelling = [],
    newArrivals = [],
    recentlyViewed = [],
    brands = [],
    reviews = [],
    wishlistProductIds = [],
}) {
    const { t } = useTranslation();

    return (
        <ShopLayout fullWidth>
            <HomeHeroSlider slides={heroSlides} />

            <HomeFlashSale
                flashSale={flashSale}
                products={flashProducts}
                wishlistProductIds={wishlistProductIds}
            />

            <HomeCategoryGrid categories={categories} />

            <HomeProductSection
                title={t('home.featured_products')}
                subtitle={t('home.featured_sub')}
                viewAllHref="/shop/products?featured=1"
                products={featured}
                wishlistProductIds={wishlistProductIds}
            />

            <HomeCampaignBanners banners={campaignBanners} />

            <HomeProductSection
                title={t('home.trending')}
                subtitle={t('home.trending_sub')}
                products={trending}
                wishlistProductIds={wishlistProductIds}
            />

            <HomeProductSection
                title={t('home.best_selling')}
                subtitle={t('home.best_selling_sub')}
                products={bestSelling}
                wishlistProductIds={wishlistProductIds}
            />

            <HomeProductSection
                title={t('home.new_arrivals')}
                subtitle={t('home.new_arrivals_sub')}
                viewAllHref="/shop/products"
                products={newArrivals}
                wishlistProductIds={wishlistProductIds}
            />

            {recentlyViewed.length > 0 && (
                <HomeProductSection
                    title={t('home.recently_viewed')}
                    subtitle={t('home.recently_viewed_sub')}
                    viewAllHref="/shop/products"
                    products={recentlyViewed}
                    wishlistProductIds={wishlistProductIds}
                />
            )}

            <HomeBrands brands={brands} />

            <HomeReviews reviews={reviews} />

            <HomeTrustSection />

            <HomeNewsletter />
        </ShopLayout>
    );
}
