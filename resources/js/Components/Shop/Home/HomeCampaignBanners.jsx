import { Link } from '@inertiajs/react';
import ShopSection from '../ShopSection';
import ShopBannerFrame from '../ShopBannerFrame';

export default function HomeCampaignBanners({ banners = [] }) {
    if (!banners.length) return null;

    return (
        <ShopSection title="Special offers" subtitle="Campaigns and seasonal promotions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((banner) => (
                    <Link
                        key={banner.id}
                        href={banner.link || '/shop/products'}
                        className="home-campaign-banner group block rounded-2xl overflow-hidden"
                    >
                        <ShopBannerFrame
                            src={banner.image}
                            alt={banner.title || ''}
                            variant="campaign"
                            className="rounded-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-[1]" />
                            <div className="relative z-[2] p-6 sm:p-8 flex flex-col justify-end min-h-full">
                                <h3 className="text-xl sm:text-2xl font-bold text-white">{banner.title}</h3>
                                {banner.subtitle && <p className="text-white/85 text-sm mt-1">{banner.subtitle}</p>}
                                <span className="inline-block mt-3 text-sm font-semibold text-white underline underline-offset-4">
                                    Shop now →
                                </span>
                            </div>
                        </ShopBannerFrame>
                    </Link>
                ))}
            </div>
        </ShopSection>
    );
}
