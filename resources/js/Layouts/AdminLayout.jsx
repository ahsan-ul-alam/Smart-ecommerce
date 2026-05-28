import { Link, usePage } from "@inertiajs/react";
import { createContext, useContext, useEffect, useState } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Bell,
    Tag,
    Star,
    FileText,
    Zap,
    BarChart3,
    Store,
    PanelLeft,
    Search,
    Plus,
    Calendar,
    ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import ApplyThemeBranding from "../Components/ApplyThemeBranding";
import LanguageSwitcher from "../Components/UI/LanguageSwitcher";
import ThemeToggle from "../Components/UI/ThemeToggle";
import { useSyncLocale } from "../hooks/useSyncLocale";

const AdminShellContext = createContext({
    collapsed: false,
    setCollapsed: () => {},
});

export const useAdminShell = () => useContext(AdminShellContext);

const navItems = [
    {
        href: "/admin",
        icon: LayoutDashboard,
        label: "nav.dashboard",
        permission: "dashboard.view",
        exact: true,
    },
    {
        href: "/admin/products",
        icon: Package,
        label: "nav.products",
        permission: "products.manage",
    },
    {
        href: "/admin/orders",
        icon: ShoppingCart,
        label: "nav.orders",
        permission: "orders.manage",
    },
    {
        href: "/admin/customers",
        icon: Users,
        label: "nav.customers",
        permission: "customers.manage",
    },
    {
        href: "/admin/special-products",
        icon: Zap,
        label: "Special Product",
        permission: "cms.manage",
        module: "special_product",
    },
    {
        href: "/admin/coupons",
        icon: Tag,
        label: "Coupons",
        permission: "coupons.manage",
        module: "coupon",
    },
    {
        href: "/admin/marketing-campaigns",
        icon: Tag,
        label: "Campaigns",
        permission: "coupons.manage",
        module: "marketing_campaign",
    },
    {
        href: "/admin/reports",
        icon: BarChart3,
        label: "Reports",
        permission: "reports.view",
        module: "analytics",
    },
    {
        href: "/admin/cms/banners",
        icon: FileText,
        label: "CMS",
        permission: "cms.manage",
    },
    {
        href: "/admin/reviews",
        icon: Star,
        label: "Reviews",
        permission: "products.manage",
        module: "reviews",
    },
    {
        href: "/admin/return-requests",
        icon: ShoppingCart,
        label: "Returns",
        permission: "orders.manage",
    },
    {
        href: "/admin/pos",
        icon: Store,
        label: "POS",
        permission: "orders.manage",
        module: "pos",
    },
    {
        href: "/admin/affiliates",
        icon: Tag,
        label: "Affiliates",
        permission: "customers.manage",
    },
    {
        href: "/admin/abandoned-carts",
        icon: ShoppingCart,
        label: "Abandoned Carts",
        permission: "orders.manage",
        module: "abandoned_cart",
    },
    {
        href: "/admin/flash-sales",
        icon: Zap,
        label: "Flash Sales",
        permission: "coupons.manage",
        module: "flash_sale",
    },
    {
        href: "/admin/vendors",
        icon: Users,
        label: "Vendors",
        permission: "products.manage",
        module: "vendor",
    },
    {
        href: "/admin/newsletter",
        icon: Users,
        label: "Newsletter",
        permission: "customers.manage",
    },
    {
        href: "/admin/contact-inquiries",
        icon: Users,
        label: "Contact",
        permission: "customers.manage",
    },
    {
        href: "/admin/team",
        icon: Users,
        label: "Team",
        permissions: ["users.manage", "roles.manage"],
    },
    {
        href: "/admin/settings/general",
        icon: Settings,
        label: "nav.settings",
        permission: "settings.manage",
    },
];

const catalogLinks = [
    { href: "/admin/products", label: "nav.products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/brands", label: "Brands" },
    { href: "/admin/inventory", label: "Low Stock" },
];

const cmsLinks = [
    { href: "/admin/cms/banners", label: "Banners" },
    { href: "/admin/cms/homepage", label: "Homepage" },
    { href: "/admin/cms/pages", label: "Pages" },
    { href: "/admin/cms/faqs", label: "FAQs" },
    { href: "/admin/cms/blog", label: "Blog", module: "blog" },
];

const settingsLinks = [
    { href: "/admin/settings/general", label: "Site" },
    { href: "/admin/settings/notifications", label: "Notifications" },
    {
        href: "/admin/notification-logs",
        label: "Message Logs",
        permission: "notifications.manage",
    },
    {
        href: "/admin/audit-logs",
        label: "Audit Logs",
        permission: "settings.manage",
    },
    {
        href: "/admin/activity-logs",
        label: "Activity Logs",
        permission: "settings.manage",
    },
    {
        href: "/admin/settings/system",
        label: "System Tools",
        permission: "settings.manage",
    },
    { href: "/admin/settings/commerce", label: "Commerce" },
    { href: "/admin/shipping-zones", label: "Shipping Zones" },
    { href: "/admin/settings/modules", label: "settings.modules" },
    { href: "/admin/settings/integrations/payment", label: "Payments" },
    {
        href: "/admin/payment-transactions",
        label: "Payment Logs",
        permission: "settings.integrations",
    },
    { href: "/admin/settings/integrations/courier", label: "Couriers" },
    { href: "/admin/settings/integrations/sms", label: "SMS" },
    { href: "/admin/settings/integrations/email", label: "Email" },
];

function SubNav({ links, url, t, can }) {
    return (
        <div className="px-4 lg:px-8 py-2.5 flex gap-2 flex-wrap border-b border-slate-200/70 dark:border-slate-700/70 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            {links
                .filter((link) => !link.permission || can(link.permission))
                .map((link) => {
                    const active =
                        url === link.href || url.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "nav-pill",
                                active
                                    ? "nav-pill-active"
                                    : "nav-pill-inactive",
                            )}
                        >
                            {link.label?.startsWith("nav.") ||
                            link.label?.startsWith("settings.")
                                ? t(link.label)
                                : link.label}
                        </Link>
                    );
                })}
        </div>
    );
}

function AdminTopBar({ title, showSearch, dateRange, can, alertCount = 0 }) {
    const { auth } = usePage().props;
    const { collapsed, setCollapsed } = useAdminShell();
    const { t } = useTranslation();
    const isDashboard = showSearch;

    const initials = auth.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="sticky top-0 z-30 h-[4.25rem] glass border-b border-slate-200/70 dark:border-slate-700/70 flex items-center gap-3 px-4 lg:px-6 shrink-0">
            <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 transition-premium shrink-0"
                title={collapsed ? t('admin.expand_sidebar') : t('admin.collapse_sidebar')}
                aria-label="Toggle sidebar"
            >
                <PanelLeft
                    size={20}
                    className={clsx(
                        "transition-transform",
                        collapsed && "rotate-180",
                    )}
                />
            </button>

            {isDashboard ? (
                <form
                    className="hidden md:flex flex-1 max-w-xl"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const q = e.target.search?.value;
                        if (q)
                            window.location.href = `/admin/products?search=${encodeURIComponent(q)}`;
                    }}
                >
                    <div className="relative w-full">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            name="search"
                            type="search"
                            placeholder={t('admin.search_anything')}
                            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 dark:bg-slate-800/70 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-premium"
                        />
                        <kbd className="hidden lg:inline absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                            Ctrl + K
                        </kbd>
                    </div>
                </form>
            ) : (
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate min-w-0 flex-1">
                    {title}
                </h1>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
                {dateRange && (
                    <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 bg-white/60 dark:bg-slate-800/60 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Calendar size={14} className="text-slate-400" />
                        {dateRange.from} – {dateRange.to}
                    </div>
                )}
                {can("products.manage") && (
                    <Link
                        href="/admin/products/create"
                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-premium"
                        style={{
                            background:
                                "linear-gradient(90deg, var(--color-admin-accent), var(--color-admin-accent-end))",
                        }}
                    >
                        <Plus size={16} /> {t('admin.create')}
                    </Link>
                )}
                <LanguageSwitcher className="hidden sm:block" />
                <ThemeToggle />
                <Link
                    href="/admin/alerts"
                    className="p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-premium relative"
                    title={
                        alertCount > 0 ? t('admin.alerts', { count: alertCount }) : t('admin.no_alerts')
                    }
                >
                    <Bell size={18} className="text-slate-500" />
                    {alertCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900">
                            {alertCount > 99 ? "99+" : alertCount}
                        </span>
                    )}
                </Link>
                <Link
                    href="/admin/settings/general"
                    className="hidden sm:flex p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-premium"
                >
                    <Settings size={18} className="text-slate-500" />
                </Link>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold flex items-center justify-center shadow-sm ml-1">
                    {initials || "A"}
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout({
    children,
    title,
    dashboardMode = false,
    dateRange = null,
    alertCount = 0,
}) {
    const { auth, modules = [], theme = {}, app } = usePage().props;
    const { url } = usePage();
    useSyncLocale();
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("admin-sidebar-collapsed") === "1";
    });

    useEffect(() => {
        localStorage.setItem("admin-sidebar-collapsed", collapsed ? "1" : "0");
    }, [collapsed]);

    const permissions = Array.isArray(auth?.user?.permissions)
        ? auth.user.permissions
        : Object.values(auth?.user?.permissions ?? {});
    const roles = Array.isArray(auth?.user?.roles)
        ? auth.user.roles
        : Object.values(auth?.user?.roles ?? {});

    const roleNames = roles
        .map((r) => (typeof r === "string" ? r : r?.name))
        .filter(Boolean);
    const displayRole = roleNames[0]?.replace(/_/g, " ") || "Admin";

    const can = (permission) =>
        permissions.includes(permission) || roleNames.includes("super_admin");

    const navCan = (item) => {
        if (item.permissions?.length) {
            return item.permissions.some((p) => can(p));
        }
        return can(item.permission);
    };

    const filteredNav = navItems.filter(
        (item) =>
            navCan(item) && (!item.module || modules.includes(item.module)),
    );

    return (
        <AdminShellContext.Provider value={{ collapsed, setCollapsed }}>
            <div className="min-h-screen admin-shell-bg flex">
                <ApplyThemeBranding />

                <aside
                    className={clsx(
                        "hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-40 transition-all duration-300 ease-out admin-sidebar",
                        collapsed ? "w-[5rem]" : "w-[17rem]",
                    )}
                >
                    <div
                        className={clsx(
                            "h-[4.25rem] flex items-center border-b border-slate-100 dark:border-slate-800",
                            collapsed ? "justify-center px-2" : "px-5 gap-3",
                        )}
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                            {app?.name?.[0] || "A"}
                        </div>
                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white tracking-tight truncate">
                                    {app?.name || "ArCommerze"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                    Admin
                                </p>
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {filteredNav.map((item) => {
                            const Icon = item.icon;
                            const active =
                                url === item.href ||
                                (!item.exact &&
                                    url.startsWith(item.href + "/")) ||
                                (item.href === "/admin/team" &&
                                    (url.startsWith("/admin/staff") ||
                                        url.startsWith("/admin/roles")));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={
                                        collapsed ? t(item.label) : undefined
                                    }
                                    className={clsx(
                                        "flex items-center gap-3 rounded-xl text-sm font-medium transition-premium",
                                        collapsed
                                            ? "justify-center p-3"
                                            : "px-3.5 py-2.5",
                                        active
                                            ? "admin-nav-active"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                    )}
                                >
                                    <Icon
                                        size={18}
                                        strokeWidth={active ? 2.25 : 1.75}
                                    />
                                    {!collapsed && (
                                        <span className="truncate">
                                            {t(item.label)}
                                        </span>
                                    )}
                                    {!collapsed && active && (
                                        <ChevronRight
                                            size={14}
                                            className="ml-auto opacity-80"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    <AdminTopBar
                        title={title}
                        showSearch={dashboardMode}
                        dateRange={dateRange}
                        can={can}
                        alertCount={alertCount}
                    />

                    {(url.startsWith("/admin/products") ||
                        url.startsWith("/admin/categories") ||
                        url.startsWith("/admin/brands")) &&
                        can("products.manage") && (
                            <SubNav
                                links={catalogLinks}
                                url={url}
                                t={t}
                                can={can}
                            />
                        )}
                    {url.startsWith("/admin/vendors") &&
                        modules.includes("vendor") &&
                        can("products.manage") && (
                            <SubNav
                                links={[
                                    {
                                        href: "/admin/vendors",
                                        label: "Vendors",
                                    },
                                    {
                                        href: "/admin/vendors/commissions",
                                        label: "Commissions",
                                    },
                                ]}
                                url={url}
                                t={t}
                                can={can}
                            />
                        )}
                    {url.startsWith("/admin/cms") && can("cms.manage") && (
                        <SubNav
                            links={cmsLinks.filter(
                                (l) => !l.module || modules.includes(l.module),
                            )}
                            url={url}
                            t={t}
                            can={can}
                        />
                    )}
                    {(url.startsWith("/admin/settings") ||
                        url.startsWith("/admin/audit-logs") ||
                        url.startsWith("/admin/activity-logs") ||
                        url.startsWith("/admin/notification-logs")) && (
                        <SubNav
                            links={settingsLinks}
                            url={url}
                            t={t}
                            can={can}
                        />
                    )}

                    <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AdminShellContext.Provider>
    );
}
