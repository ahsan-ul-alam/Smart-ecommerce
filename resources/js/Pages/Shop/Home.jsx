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
                title="Featured products"
                subtitle="Hand-picked deals for you"
                viewAllHref="/shop/products?featured=1"
                products={featured}
                wishlistProductIds={wishlistProductIds}
            />

            <HomeCampaignBanners banners={campaignBanners} />

            <HomeProductSection
                title="Trending now"
                subtitle="Popular picks this week"
                products={trending}
                wishlistProductIds={wishlistProductIds}
            />

            <HomeProductSection
                title="Best selling"
                subtitle="Top orders from our customers"
                products={bestSelling}
                wishlistProductIds={wishlistProductIds}
            />

            <HomeProductSection
                title="New arrivals"
                subtitle="Fresh products just landed"
                viewAllHref="/shop/products"
                products={newArrivals}
                wishlistProductIds={wishlistProductIds}
            />

            {recentlyViewed.length > 0 && (
                <HomeProductSection
                    title="Recently viewed"
                    subtitle="Continue where you left off"
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
