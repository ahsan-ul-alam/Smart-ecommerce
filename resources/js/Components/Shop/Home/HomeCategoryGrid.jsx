import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    Smartphone, Shirt, Home, Sparkles, Watch, Laptop, Baby, UtensilsCrossed, Grid3X3,
} from 'lucide-react';
import ShopSection from '../ShopSection';

const iconMap = [
    { match: /electronic|mobile|phone|gadget/i, icon: Smartphone },
    { match: /fashion|cloth|apparel|wear/i, icon: Shirt },
    { match: /home|living|furniture/i, icon: Home },
    { match: /beauty|cosmetic|skin/i, icon: Sparkles },
    { match: /watch|accessori|jewel/i, icon: Watch },
    { match: /computer|laptop|pc/i, icon: Laptop },
    { match: /baby|kid/i, icon: Baby },
    { match: /food|grocery|kitchen/i, icon: UtensilsCrossed },
];

function categoryIcon(name) {
    const found = iconMap.find(({ match }) => match.test(name));
    return found?.icon ?? Grid3X3;
}

export default function HomeCategoryGrid({ categories = [] }) {
    const { t } = useTranslation();
    if (!categories.length) return null;

    return (
        <ShopSection title={t('home.shop_by_category')} subtitle={t('home.category_sub')}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {categories.map((cat) => {
                    const Icon = categoryIcon(cat.name);
                    return (
                        <Link key={cat.id} href={`/shop/products?category=${cat.id}`} className="home-category-card group">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                {cat.image ? (
                                    <img src={cat.image} alt="" className="w-full h-full object-cover rounded-2xl" loading="lazy" />
                                ) : (
                                    <Icon size={26} />
                                )}
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{cat.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{cat.products_count} products</p>
                        </Link>
                    );
                })}
            </div>
        </ShopSection>
    );
}
