import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
    ShoppingCart, Search, Home, Grid3X3, User, Zap, Menu, X,
    Truck, ShieldCheck, Package, Heart, ChevronDown, Mail,
} from 'lucide-react';
import clsx from 'clsx';
import FlashMessage from '../Components/UI/FlashMessage';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';
import MiniCartDrawer from '../Components/Shop/MiniCartDrawer';
import CampaignPopup from '../Components/Shop/CampaignPopup';

const primaryNav = [
    { href: '/shop/products', label: 'All Products', match: (url) => url.startsWith('/shop/products') && !url.includes('featured') },
    { href: '/shop/products?featured=1', label: 'Featured', match: (url) => url.includes('featured=1') },
    { href: '/shop/flash-sales', label: 'Flash Sale', module: 'flash_sale', accent: true, match: (url) => url.startsWith('/shop/flash-sales') },
    { href: '/shop/contact', label: 'Contact', match: (url) => url.startsWith('/shop/contact') },
];

const footerShop = [
    { href: '/shop/products', label: 'All products' },
    { href: '/shop/products?featured=1', label: 'Featured' },
    { href: '/shop/cart', label: 'Cart' },
    { href: '/wishlist', label: 'Wishlist', auth: true },
];

const footerSupport = [
    { href: '/shop/faq', label: 'FAQ' },
    { href: '/shop/contact', label: 'Contact' },
    { href: '/newsletter/unsubscribe', label: 'Newsletter' },
];

export default function ShopLayout({ children, fullWidth = false }) {
    const {
        app, auth, cart, footerPages = [], modules = [], theme = {}, branding = {},
        campaignPopup, url, shopNav = {}, wishlistCount = 0,
    } = usePage().props;
    const categories = shopNav.categories ?? [];
    const itemCount = cart?.item_count ?? 0;
    const newsletter = useForm({ email: '' });
    const [mobileMenu, setMobileMenu] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const userMenuRef = useRef(null);

    const currentUrl = url ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');

    const navItems = useMemo(
        () => primaryNav.filter((item) => !item.module || modules.includes(item.module)),
        [modules],
    );

    useEffect(() => {
        const close = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const subscribe = (e) => {
        e.preventDefault();
        newsletter.post('/newsletter/subscribe', { preserveScroll: true, onSuccess: () => newsletter.reset() });
    };

    const submitSearch = (e) => {
        e.preventDefault();
        router.get('/shop/products', {
            search: searchQuery || undefined,
            category: searchCategory || undefined,
        });
        setMobileMenu(false);
    };

    const isActive = (item) => (item.match ? item.match(currentUrl) : currentUrl === item.href);
    const isAdmin = auth.user?.roles?.some((r) => ['super_admin', 'admin', 'staff'].includes(r));
    const storeEmail = branding.store_email;

    return (
        <div className="min-h-screen shop-mesh-bg flex flex-col pb-20 md:pb-0">
            <ApplyThemeBranding />
            <FlashMessage />
            {modules.includes('marketing_campaign') && <CampaignPopup campaign={campaignPopup} />}

            <div className="shop-top-bar hidden sm:block">
                <div className="shop-container py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {storeEmail ? (
                        <a href={`mailto:${storeEmail}`} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Mail size={13} /> {storeEmail}
                        </a>
                    ) : (
                        <span />
                    )}
                    <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1">
                        <span className="inline-flex items-center gap-1.5"><Truck size={13} className="text-primary" /> Nationwide delivery</span>
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-primary" /> Cash on delivery</span>
                        <span className="inline-flex items-center gap-1.5"><Package size={13} className="text-primary" /> Easy returns</span>
                        {branding.store_phone && (
                            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                {branding.store_phone}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <header className="shop-navbar">
                <div className="shop-container">
                    <div className="flex items-center gap-3 sm:gap-4 py-3 lg:py-4">
                        <Link href="/" className="shrink-0 flex items-center">
                            {theme.logo ? (
                                <img src={theme.logo} alt={app.name} className="h-10 sm:h-11 w-auto max-w-[160px] object-contain" />
                            ) : (
                                <span className="text-xl font-bold text-primary tracking-tight">{app.name}</span>
                            )}
                        </Link>

                        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-2xl mx-2 lg:mx-6">
                            <div className="shop-search-bar w-full flex">
                                <div className="relative shrink-0">
                                    <select
                                        value={searchCategory}
                                        onChange={(e) => setSearchCategory(e.target.value)}
                                        className="shop-search-category h-full pl-3 pr-8 py-3 text-sm border-r border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 rounded-l-xl appearance-none cursor-pointer"
                                        aria-label="Category"
                                    >
                                        <option value="">All categories</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for products…"
                                    className="flex-1 min-w-0 px-4 py-3 text-sm border-0 bg-white dark:bg-slate-800 focus:outline-none focus:ring-0"
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 px-5 rounded-r-xl bg-primary text-white hover:opacity-90 transition-premium"
                                    aria-label="Search"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                        </form>

                        <nav className="hidden xl:flex items-center gap-0.5 ml-auto" aria-label="Main">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        'px-3 py-2 rounded-lg text-sm font-medium transition-premium whitespace-nowrap',
                                        isActive(item)
                                            ? 'text-primary font-semibold'
                                            : item.accent
                                                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-primary',
                                    )}
                                >
                                    {item.accent && <Zap size={14} className="inline mr-1 -mt-0.5 fill-amber-400" />}
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-0.5 sm:gap-1 ml-auto xl:ml-2">
                            <button
                                type="button"
                                onClick={() => setCartOpen(true)}
                                className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-premium"
                                aria-label="Cart"
                            >
                                <ShoppingCart size={22} className="text-slate-700 dark:text-slate-200" />
                                <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            </button>

                            <Link
                                href={auth.user ? '/wishlist' : '/login'}
                                className="relative hidden sm:flex p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-premium"
                                aria-label="Wishlist"
                            >
                                <Heart size={22} className="text-slate-700 dark:text-slate-200" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {wishlistCount > 9 ? '9+' : wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {auth.user ? (
                                <div className="relative hidden sm:block" ref={userMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setUserMenuOpen((v) => !v)}
                                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-premium"
                                    >
                                        {auth.user.avatar ? (
                                            <img src={auth.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                                                {auth.user.name?.charAt(0)}
                                            </span>
                                        )}
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[5rem] truncate hidden lg:inline">
                                            {auth.user.name?.split(' ')[0]}
                                        </span>
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </button>
                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg z-[60]">
                                            {isAdmin ? (
                                                <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-primary hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setUserMenuOpen(false)}>
                                                    Admin panel
                                                </Link>
                                            ) : (
                                                <Link href="/account" className="block px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setUserMenuOpen(false)}>
                                                    My account
                                                </Link>
                                            )}
                                            <Link href="/wishlist" className="block px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setUserMenuOpen(false)}>
                                                Wishlist
                                            </Link>
                                            <Link href="/logout" method="post" as="button" className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                                                Sign out
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold bg-primary text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-premium">
                                    Sign in
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={() => setMobileMenu((v) => !v)}
                                className="xl:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                                aria-label="Menu"
                                aria-expanded={mobileMenu}
                            >
                                {mobileMenu ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>

                    {mobileMenu && (
                        <div className="xl:hidden pb-4 border-t border-slate-200/60 dark:border-slate-700/60 pt-4 space-y-4">
                            <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
                                <select
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    className="input-premium sm:w-40"
                                >
                                    <option value="">All categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products…"
                                    className="input-premium flex-1"
                                />
                                <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
                                    Search
                                </button>
                            </form>
                            <nav className="grid grid-cols-2 gap-2 text-sm">
                                <Link href="/" className="p-3 rounded-xl bg-white dark:bg-slate-800 border font-medium flex items-center gap-2" onClick={() => setMobileMenu(false)}>
                                    <Home size={16} /> Home
                                </Link>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={clsx('p-3 rounded-xl bg-white dark:bg-slate-800 border font-medium', item.accent && 'text-amber-700')}
                                        onClick={() => setMobileMenu(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            {!auth.user && (
                                <Link href="/login" className="block text-center py-3 rounded-xl bg-primary text-white font-semibold" onClick={() => setMobileMenu(false)}>
                                    Sign in
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full">
                {fullWidth ? children : <div className="shop-container py-6 lg:py-10">{children}</div>}
            </main>

            <MiniCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

            <footer className="shop-footer">
                <div className="shop-container py-12 lg:py-14">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <p className="font-bold text-lg text-slate-900 dark:text-white">{app.name}</p>
                            {app.tagline && <p className="text-sm text-slate-500 mt-1">{app.tagline}</p>}
                            <p className="text-xs text-slate-400 mt-4">© {new Date().getFullYear()} All rights reserved.</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Shop</p>
                            <ul className="space-y-2 text-sm text-slate-500">
                                {footerShop.filter((l) => !l.auth || auth.user).map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Help</p>
                            <ul className="space-y-2 text-sm text-slate-500">
                                {footerSupport.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link>
                                    </li>
                                ))}
                                {footerPages.map((p) => (
                                    <li key={p.slug}>
                                        <Link href={`/pages/${p.slug}`} className="hover:text-primary transition-colors">{p.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Stay updated</p>
                            <form onSubmit={subscribe} className="space-y-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    value={newsletter.data.email}
                                    onChange={(e) => newsletter.setData('email', e.target.value)}
                                    className="input-premium w-full"
                                />
                                <button
                                    type="submit"
                                    disabled={newsletter.processing}
                                    className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-premium"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </footer>

            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass-dark border-t safe-area-pb" aria-label="Mobile">
                <div className="grid grid-cols-4 h-16">
                    {[
                        { href: '/', icon: Home, label: 'Home', active: currentUrl === '/' },
                        { href: '/shop/products', icon: Grid3X3, label: 'Shop', active: currentUrl.startsWith('/shop/products') },
                        { action: () => setCartOpen(true), icon: ShoppingCart, label: 'Cart', badge: itemCount, active: false },
                        { href: auth.user ? '/account' : '/login', icon: User, label: auth.user ? 'Account' : 'Sign in', active: currentUrl.startsWith('/account') || currentUrl === '/login' },
                    ].map((item, idx) => {
                        const className = clsx(
                            'flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors relative',
                            item.active ? 'text-primary' : 'text-slate-500',
                        );
                        const inner = (
                            <>
                                <item.icon size={20} strokeWidth={item.active ? 2.25 : 1.75} />
                                {item.label}
                                {item.badge > 0 && (
                                    <span className="absolute top-1.5 right-[calc(50%-1.25rem)] min-w-[1rem] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </>
                        );
                        if (item.action) {
                            return (
                                <button key={idx} type="button" onClick={item.action} className={className}>
                                    {inner}
                                </button>
                            );
                        }
                        return (
                            <Link key={item.href} href={item.href} className={className}>
                                {inner}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
