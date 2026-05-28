import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, MapPin, ShoppingBag, Gift } from 'lucide-react';
import ShopLayout from './ShopLayout';
import clsx from 'clsx';

export default function AccountLayout({ children, title }) {
    const { url, modules = [] } = usePage().props;

    const links = [
        { href: '/account', icon: LayoutDashboard, label: 'Overview', exact: true },
        { href: '/account/orders', icon: Package, label: 'My Orders' },
        ...(modules.includes('loyalty') || modules.includes('wallet')
            ? [{ href: '/account/rewards', icon: Gift, label: 'Points & Wallet' }]
            : []),
        { href: '/account/addresses', icon: MapPin, label: 'Addresses' },
        { href: '/shop/products', icon: ShoppingBag, label: 'Continue Shopping' },
    ];

    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{title}</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-56 shrink-0">
                        <nav className="space-y-1">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const active = link.exact
                                    ? url === link.href || url === link.href + '/'
                                    : url.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={clsx(
                                            'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
                                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                        )}
                                    >
                                        <Icon size={16} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                    <div className="flex-1 min-w-0">{children}</div>
                </div>
            </div>
        </ShopLayout>
    );
}
