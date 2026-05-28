import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Package, ShoppingCart, Users, Settings,
    Moon, Sun, Globe, LogOut, Bell, Tag, Star, FileText, Zap, BarChart3, Store,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'nav.dashboard', permission: 'dashboard.view', exact: true },
    { href: '/admin/products', icon: Package, label: 'nav.products', permission: 'products.manage' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'nav.orders', permission: 'orders.manage' },
    { href: '/admin/return-requests', icon: ShoppingCart, label: 'Returns', permission: 'orders.manage' },
    { href: '/admin/pos', icon: Store, label: 'POS', permission: 'orders.manage', module: 'pos' },
    { href: '/admin/reports', icon: BarChart3, label: 'Reports', permission: 'reports.view' },
    { href: '/admin/coupons', icon: Tag, label: 'Coupons', permission: 'coupons.manage' },
    { href: '/admin/affiliates', icon: Tag, label: 'Affiliates', permission: 'customers.manage' },
    { href: '/admin/abandoned-carts', icon: ShoppingCart, label: 'Abandoned Carts', permission: 'orders.manage', module: 'abandoned_cart' },
    { href: '/admin/flash-sales', icon: Zap, label: 'Flash Sales', permission: 'coupons.manage' },
    { href: '/admin/reviews', icon: Star, label: 'Reviews', permission: 'products.manage' },
    { href: '/admin/cms/banners', icon: FileText, label: 'CMS', permission: 'cms.manage' },
    { href: '/admin/vendors', icon: Users, label: 'Vendors', permission: 'products.manage', module: 'vendor' },
    { href: '/admin/customers', icon: Users, label: 'nav.customers', permission: 'customers.manage' },
    { href: '/admin/newsletter', icon: Users, label: 'Newsletter', permission: 'customers.manage' },
    { href: '/admin/contact-inquiries', icon: Users, label: 'Contact', permission: 'customers.manage' },
    { href: '/admin/team', icon: Users, label: 'Team', permissions: ['users.manage', 'roles.manage'] },
    { href: '/admin/settings/general', icon: Settings, label: 'nav.settings', permission: 'settings.manage' },
];

const catalogLinks = [
    { href: '/admin/products', label: 'nav.products' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/brands', label: 'Brands' },
    { href: '/admin/inventory', label: 'Low Stock' },
];

const cmsLinks = [
    { href: '/admin/cms/banners', label: 'Banners' },
    { href: '/admin/cms/homepage', label: 'Homepage' },
    { href: '/admin/cms/pages', label: 'Pages' },
    { href: '/admin/cms/faqs', label: 'FAQs' },
    { href: '/admin/cms/blog', label: 'Blog', module: 'blog' },
];

const vendorLink = { href: '/admin/vendors', label: 'Vendors', module: 'vendor' };

const settingsLinks = [
    { href: '/admin/settings/general', label: 'Site' },
    { href: '/admin/settings/notifications', label: 'Notifications' },
    { href: '/admin/notification-logs', label: 'Message Logs', permission: 'notifications.manage' },
    { href: '/admin/audit-logs', label: 'Audit Logs', permission: 'settings.manage' },
    { href: '/admin/activity-logs', label: 'Activity Logs', permission: 'settings.manage' },
    { href: '/admin/settings/system', label: 'System Tools', permission: 'settings.manage' },
    { href: '/admin/settings/commerce', label: 'Commerce' },
    { href: '/admin/shipping-zones', label: 'Shipping Zones' },
    { href: '/admin/settings/modules', label: 'settings.modules' },
    { href: '/admin/settings/integrations/payment', label: 'Payments' },
    { href: '/admin/settings/integrations/courier', label: 'Couriers' },
    { href: '/admin/settings/integrations/sms', label: 'SMS' },
    { href: '/admin/settings/integrations/email', label: 'Email' },
];

export default function AdminLayout({ children, title }) {
    const { auth, modules = [], theme = {}, app } = usePage().props;
    const { url } = usePage();
    const { t, i18n } = useTranslation();
    const { dark, toggle } = useTheme();

    const permissions = Array.isArray(auth?.user?.permissions)
        ? auth.user.permissions
        : Object.values(auth?.user?.permissions ?? {});
    const roles = Array.isArray(auth?.user?.roles)
        ? auth.user.roles
        : Object.values(auth?.user?.roles ?? {});

    const roleNames = roles.map((r) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);

    const can = (permission) =>
        permissions.includes(permission) || roleNames.includes('super_admin');

    const navCan = (item) => {
        if (item.permissions?.length) {
            return item.permissions.some((p) => can(p));
        }
        return can(item.permission);
    };

    const toggleLocale = () => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            <ApplyThemeBranding />
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
                <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-800">
                    {theme.logo ? (
                        <img src={theme.logo} alt="" className="h-8 w-auto max-w-[120px] object-contain" />
                    ) : (
                        <span className="text-white font-bold text-lg">{app?.name || 'ArCommerze'}</span>
                    )}
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.filter((item) => navCan(item) && (!item.module || modules.includes(item.module))).map((item) => {
                        const Icon = item.icon;
                        const active = url === item.href
                            || url.startsWith(item.href + '/')
                            || (item.href === '/admin/team' && (url.startsWith('/admin/staff') || url.startsWith('/admin/roles')));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                                    active
                                        ? 'bg-teal-700 text-white'
                                        : 'hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <Icon size={18} />
                                {t(item.label)}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800 text-sm">
                    <p className="text-white font-medium truncate">{auth.user?.name}</p>
                    <p className="text-slate-500 truncate text-xs">{auth.user?.email}</p>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h1>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={toggleLocale} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Language">
                            <Globe size={18} className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <button type="button" onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Theme">
                            {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
                        </button>
                        <button type="button" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
                            <Bell size={18} className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <Link href="/logout" method="post" as="button" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                            <LogOut size={18} className="text-slate-600 dark:text-slate-300" />
                        </Link>
                    </div>
                </header>
                {(url.startsWith('/admin/products') || url.startsWith('/admin/categories') || url.startsWith('/admin/brands')) && can('products.manage') && (
                    <div className="px-6 pt-4 flex gap-2 flex-wrap border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {catalogLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                                    url === link.href || url.startsWith(link.href + '/')
                                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                                )}
                            >
                                {link.label.startsWith('nav.') ? t(link.label) : link.label}
                            </Link>
                        ))}
                    </div>
                )}
                {url.startsWith('/admin/vendors') && modules.includes('vendor') && can('products.manage') && (
                    <div className="px-6 pt-4 flex gap-2 border-b bg-white dark:bg-slate-800">
                        <Link href={vendorLink.href} className={clsx('px-3 py-1.5 rounded-lg text-sm', url === vendorLink.href ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100')}>{vendorLink.label}</Link>
                        <Link href="/admin/vendors/commissions" className={clsx('px-3 py-1.5 rounded-lg text-sm', url.startsWith('/admin/vendors/commissions') ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100')}>Commissions</Link>
                    </div>
                )}
                {url.startsWith('/admin/cms') && can('cms.manage') && (
                    <div className="px-6 pt-4 flex gap-2 flex-wrap border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {cmsLinks.filter((link) => !link.module || modules.includes(link.module)).map((link) => (
                            <Link key={link.href} href={link.href} className={clsx('px-3 py-1.5 rounded-lg text-sm', url.startsWith(link.href) ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100')}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
                {(url.startsWith('/admin/settings')
                    || url.startsWith('/admin/audit-logs')
                    || url.startsWith('/admin/activity-logs')
                    || url.startsWith('/admin/notification-logs')) && (
                    <div className="px-6 pt-4 flex gap-2 flex-wrap border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {settingsLinks.filter((link) => !link.permission || can(link.permission)).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                                    url === link.href || url.startsWith(link.href)
                                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                                )}
                            >
                                {link.label.startsWith('settings.') ? t(link.label) : link.label}
                            </Link>
                        ))}
                    </div>
                )}
                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
