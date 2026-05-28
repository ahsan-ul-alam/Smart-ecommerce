import { Link, useForm, usePage } from '@inertiajs/react';
import { ShoppingCart, Search } from 'lucide-react';
import FlashMessage from '../Components/UI/FlashMessage';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';

export default function ShopLayout({ children }) {
    const { app, auth, cart, footerPages = [], modules = [], theme = {} } = usePage().props;
    const itemCount = cart?.item_count ?? 0;
    const newsletter = useForm({ email: '' });

    const subscribe = (e) => {
        e.preventDefault();
        newsletter.post('/newsletter/subscribe', { preserveScroll: true, onSuccess: () => newsletter.reset() });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <ApplyThemeBranding />
            <FlashMessage />
            <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <Link href="/" className="shrink-0 flex items-center">
                        {theme.logo ? (
                            <img src={theme.logo} alt={app.name} className="h-9 w-auto max-w-[160px] object-contain" />
                        ) : (
                            <span className="text-xl font-bold text-teal-700 dark:text-teal-400">{app.name}</span>
                        )}
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Link href="/shop/products" className="hover:text-teal-700">Shop</Link>
                        <Link href="/shop/products?featured=1" className="hover:text-teal-700">Featured</Link>
                        <Link href="/shop/flash-sales" className="hover:text-teal-700 text-amber-700 dark:text-amber-400 font-semibold">Flash Sale</Link>
                        <Link href="/shop/faq" className="hover:text-teal-700">FAQ</Link>
                        {modules.includes('blog') && (
                            <Link href="/shop/blog" className="hover:text-teal-700">Blog</Link>
                        )}
                        {auth.user && <Link href="/wishlist" className="hover:text-teal-700">Wishlist</Link>}
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/shop/products" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg md:hidden">
                            <Search size={20} />
                        </Link>
                        <Link href="/shop/cart" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <ShoppingCart size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                        {auth.user ? (
                            <div className="flex items-center gap-3">
                                {auth.user.roles?.some((r) => ['super_admin', 'admin', 'staff'].includes(r)) ? (
                                    <Link href="/admin" className="text-sm text-teal-700 font-medium hidden sm:block">Admin</Link>
                                ) : (
                                    <Link href="/account" className="text-sm text-slate-600 hover:text-teal-700 hidden sm:block">My Account</Link>
                                )}
                                <Link href="/logout" method="post" as="button" className="text-sm text-slate-500 hover:text-slate-800">Logout</Link>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800">Login</Link>
                        )}
                    </div>
                </div>
            </header>
            <main>{children}</main>
            <footer className="border-t border-slate-200 dark:border-slate-700 mt-16 py-10">
                <div className="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-3">
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-white mb-1">{app.name}</p>
                        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Bangladesh Smart eCommerce.</p>
                    </div>
                    {footerPages.length > 0 && (
                        <nav className="flex flex-wrap gap-4 text-sm text-slate-500">
                            {footerPages.map((p) => (
                                <Link key={p.slug} href={`/pages/${p.slug}`} className="hover:text-teal-700">
                                    {p.title}
                                </Link>
                            ))}
                        </nav>
                    )}
                    <form onSubmit={subscribe} className="md:col-span-1 md:justify-self-end w-full max-w-sm">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Newsletter</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                required
                                placeholder="Your email"
                                value={newsletter.data.email}
                                onChange={(e) => newsletter.setData('email', e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={newsletter.processing}
                                className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-60"
                            >
                                Join
                            </button>
                        </div>
                        {newsletter.errors.email && (
                            <p className="text-xs text-red-600 mt-1">{newsletter.errors.email}</p>
                        )}
                    </form>
                </div>
            </footer>
        </div>
    );
}
