import { useTranslation } from 'react-i18next';
import ShopBreadcrumbs from './ShopBreadcrumbs';

export default function ShopCatalogHero({ title, description, featured = false }) {
    const { t } = useTranslation();
    const heroTitle = title ?? t('shop.shop_title');
    return (
        <section className="shop-catalog-hero">
            <div className="shop-container relative z-[1] py-8 sm:py-10">
                <ShopBreadcrumbs items={[{ label: 'Shop' }]} className="text-white/80 [&_a]:text-white/90 [&_span]:text-white" />
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mt-3">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{heroTitle}</h1>
                        {description && (
                            <p className="text-white/85 mt-2 text-sm sm:text-base max-w-lg">{description}</p>
                        )}
                    </div>
                    <div className="hidden md:block shrink-0" aria-hidden>
                        <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="opacity-90">
                            <rect x="28" y="20" width="64" height="52" rx="8" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
                            <path d="M28 32h64" stroke="white" strokeWidth="2" />
                            <circle cx="42" cy="58" r="6" fill="#fbbf24" />
                            <circle cx="78" cy="48" r="4" fill="#34d399" />
                            <circle cx="90" cy="62" r="5" fill="#f472b6" />
                            <rect x="48" y="8" width="24" height="16" rx="4" fill="#fbbf24" opacity="0.9" />
                        </svg>
                    </div>
                </div>
            </div>
            {featured && (
                <span className="absolute top-4 right-4 sm:right-8 px-3 py-1 rounded-full bg-amber-400/90 text-amber-950 text-xs font-bold">
                    {t('nav.featured')}
                </span>
            )}
        </section>
    );
}
