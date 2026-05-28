import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ShoppingCart, Search, Home, Grid3X3, User, Zap, Menu, X,
} from 'lucide-react';
import FlashMessage from '../Components/UI/FlashMessage';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';
import MiniCartDrawer from '../Components/Shop/MiniCartDrawer';
import CampaignPopup from '../Components/Shop/CampaignPopup';

export default function ShopLayout({ children }) {
    const { app, auth, cart, footerPages = [], modules = [], theme = {}, campaignPopup } = usePage().props;
    const itemCount = cart?.item_count ?? 0;
    const newsletter = useForm({ email: '' });
    const [mobileMenu, setMobileMenu] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const subscribe = (e) => {
        e.preventDefault();
        newsletter.post('/newsletter/subscribe', { preserveScroll: true, onSuccess: () => newsletter.reset() });
    };

    const submitSearch = (e) => {
        e.preventDefault();
        router.get('/shop/products', { search: searchQuery || undefined });
        setMobileMenu(false);
    };

    const navLinkClass = 'text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors';

    return (
        <div className="min-h-screen shop-mesh-bg pb-20 md:pb-0">
            <ApplyThemeBranding />
            <FlashMessage />
            {modules.includes('marketing_campaign') && <CampaignPopup campaign={campaignPopup} />}

            <header className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="h-16 flex items-center gap-3 sm:gap-6">
                        <Link href="/" className="shrink-0 flex items-center">
                            {theme.logo ? (
                                <img src={theme.logo} alt={app.name} className="h-9 w-auto max-w-[140px] object-contain" />
                            ) : (
                                <span className="text-lg font-bold text-primary tracking-tight">{app.name}</span>
                            )}
                        </Link>

                        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xl">
                            <div className="relative w-full">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products, brands…"
                                    className="input-premium pl-10 py-2.5 glass"
                                />
                            </div>
                        </form>

                        <nav className="hidden lg:flex items-center gap-6 ml-auto">
                            <Link href="/shop/products" className={navLinkClass}>Shop</Link>
                            <Link href="/shop/products?featured=1" className={navLinkClass}>Featured</Link>
                            {modules.includes('flash_sale') && (
                                <Link href="/shop/flash-sales" className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Zap size={14} /> Flash Sale
                                </Link>
                            )}
                            <Link href="/shop/faq" className={navLinkClass}>FAQ</Link>
                            <Link href="/shop/contact" className={navLinkClass}>Contact</Link>
                            {modules.includes('blog') && <Link href="/shop/blog" className={navLinkClass}>Blog</Link>}
                        </nav>

                        <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
                            <button
                                type="button"
                                onClick={() => setCartOpen(true)}
                                className="relative p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-premium"
                                aria-label="Open cart"
                            >
                                <ShoppingCart size={20} />
                                {itemCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[1.125rem] h-[1.125rem] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {itemCount > 9 ? '9+' : itemCount}
                                    </span>
                                )}
                            </button>
                            {auth.user ? (
                                <>
                                    {auth.user.roles?.some((r) => ['super_admin', 'admin', 'staff'].includes(r)) ? (
                                        <Link href="/admin" className="hidden sm:inline text-sm font-semibold text-primary px-3 py-2 rounded-xl hover:bg-primary/10">Admin</Link>
                                    ) : (
                                        <Link href="/account" className="hidden sm:inline text-sm font-medium text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-100/80">Account</Link>
                                    )}
                                    <Link href="/logout" method="post" as="button" className="hidden sm:inline text-sm text-slate-500 px-2 py-2 hover:text-slate-800">Logout</Link>
                                </>
                            ) : (
                                <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-teal-800 transition-premium btn-primary-glow">
                                    Login
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => setMobileMenu((v) => !v)}
                                className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                                aria-label="Menu"
                            >
                                {mobileMenu ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>

                    {mobileMenu && (
                        <div className="lg:hidden pb-4 border-t border-slate-200/50 dark:border-slate-700/50 pt-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
                            <form onSubmit={submitSearch} className="flex gap-2">
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products…"
                                    className="input-premium flex-1"
                                />
                                <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">Go</button>
                            </form>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <Link href="/shop/products" className="p-3 rounded-xl glass font-medium" onClick={() => setMobileMenu(false)}>Shop</Link>
                                <Link href="/shop/flash-sales" className="p-3 rounded-xl glass font-medium text-amber-700" onClick={() => setMobileMenu(false)}>Flash Sale</Link>
                                <Link href="/shop/faq" className="p-3 rounded-xl glass font-medium" onClick={() => setMobileMenu(false)}>FAQ</Link>
                                <Link href="/shop/contact" className="p-3 rounded-xl glass font-medium" onClick={() => setMobileMenu(false)}>Contact</Link>
                            </div>
                            {!auth.user && (
                                <Link href="/login" className="block text-center py-3 rounded-xl bg-primary text-white font-semibold" onClick={() => setMobileMenu(false)}>Login</Link>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-6 lg:py-8">
                    {children}
                </div>
            </main>
            <MiniCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

            <footer className="border-t border-slate-200/80 dark:border-slate-800 mt-16 py-12 glass">
                <div className="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-3">
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white mb-1">{app.name}</p>
                        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Premium eCommerce for Bangladesh.</p>
                    </div>
                    {footerPages.length > 0 && (
                        <nav className="flex flex-wrap gap-4 text-sm text-slate-500">
                            {footerPages.map((p) => (
                                <Link key={p.slug} href={`/pages/${p.slug}`} className="hover:text-primary transition-colors">
                                    {p.title}
                                </Link>
                            ))}
                        </nav>
                    )}
                    <form onSubmit={subscribe} className="md:justify-self-end w-full max-w-sm">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Newsletter</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                required
                                placeholder="Your email"
                                value={newsletter.data.email}
                                onChange={(e) => newsletter.setData('email', e.target.value)}
                                className="input-premium flex-1"
                            />
                            <button type="submit" disabled={newsletter.processing} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-teal-800 disabled:opacity-60 transition-premium">
                                Join
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            <Link href="/newsletter/unsubscribe" className="hover:text-primary">Unsubscribe</Link>
                        </p>
                    </form>
                </div>
            </footer>

            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-slate-200/60 dark:border-slate-700/60 safe-area-pb">
                <div className="grid grid-cols-4 h-16">
                    {[
                        { href: '/', icon: Home, label: 'Home' },
                        { href: '/shop/products', icon: Grid3X3, label: 'Shop' },
                        { href: '/shop/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
                        { href: auth.user ? '/account' : '/login', icon: User, label: auth.user ? 'Account' : 'Login' },
                    ].map(({ href, icon: Icon, label, badge }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-primary transition-colors relative"
                        >
                            <Icon size={20} strokeWidth={1.75} />
                            {label}
                            {badge > 0 && (
                                <span className="absolute top-2 right-[calc(50%-1.25rem)] min-w-[1rem] h-4 px-1 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {badge > 9 ? '9+' : badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
