import { Link, router } from '@inertiajs/react';
import clsx from 'clsx';
import {
    ShoppingCart, DollarSign, Users, Package, TrendingUp, Eye,
    Plus, Store, Tag, BarChart3, Inbox, Star, Mail, RotateCcw, AlertTriangle,
    ArrowUpRight, Sparkles,
} from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import KpiCard from '../../Components/Admin/KpiCard';
import SalesChart from '../../Components/Admin/SalesChart';
import DonutChart from '../../Components/Admin/DonutChart';
import Badge from '../../Components/UI/Badge';

const formatCurrency = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

const statusVariant = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    delivered: 'success',
    shipped: 'info',
    cancelled: 'default',
};

const quickActionIcons = {
    plus: Plus,
    cart: ShoppingCart,
    store: Store,
    tag: Tag,
    chart: BarChart3,
    users: Users,
};

const storeStatIcons = {
    package: Package,
    star: Star,
    alert: AlertTriangle,
    cart: ShoppingCart,
    mail: Mail,
    return: RotateCcw,
};

export default function Dashboard({
    user,
    stats,
    trends = {},
    sparklines = {},
    daily = [],
    ordersByStatus = [],
    topProducts = [],
    recentOrders = [],
    dateRange,
    period = 7,
    periods = [],
    quickActions = [],
    storeStats = [],
}) {
    const periodLabel = periods.find((p) => p.value === period)?.label ?? `Last ${period} days`;
    const trendLabel = 'vs previous period';
    const maxProductQty = Math.max(...topProducts.map((p) => p.quantity), 1);
    const firstName = user?.name?.split(' ')[0] || 'Admin';

    const setPeriod = (value) => {
        router.get('/admin', { period: value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout
            title="Dashboard"
            dashboardMode
            dateRange={dateRange}
            alertCount={stats.alert_count}
        >
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 mb-8 bg-gradient-to-br from-primary/15 via-secondary/10 to-white dark:from-primary/25 dark:via-secondary/15 dark:to-slate-900">
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/60 text-xs font-semibold text-primary mb-3">
                                <Sparkles size={14} />
                                {periodLabel} overview
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Welcome back, {firstName}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base max-w-xl">
                                You have <strong className="text-slate-900 dark:text-white">{stats.orders_today}</strong> orders today
                                {' '}worth <strong className="text-primary">{formatCurrency(stats.revenue_today)}</strong>.
                                {stats.pending_orders > 0 && (
                                    <> <span className="text-amber-600 dark:text-amber-400">{stats.pending_orders} pending</span> need attention.</>
                                )}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                            {periods.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPeriod(p.value)}
                                    className={clsx(
                                        'px-4 py-2 rounded-xl text-xs font-semibold transition-premium',
                                        period === p.value
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-600/80',
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Orders today', value: stats.orders_today },
                            { label: 'Revenue today', value: formatCurrency(stats.revenue_today) },
                            { label: 'Pending', value: stats.pending_orders },
                            { label: 'Conversion', value: `${stats.conversion_rate}%` },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-xl bg-white/75 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 px-4 py-3"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 lg:gap-5 mb-6">
                <KpiCard
                    title="Orders"
                    value={stats.orders_period}
                    icon={ShoppingCart}
                    trend={trends.orders}
                    trendLabel={trendLabel}
                    sparkData={sparklines.orders}
                    sparkKey="orders"
                    color="primary"
                />
                <KpiCard
                    title="Revenue"
                    value={formatCurrency(stats.revenue_period)}
                    icon={DollarSign}
                    trend={trends.revenue}
                    trendLabel={trendLabel}
                    sparkData={sparklines.revenue}
                    sparkKey="revenue"
                    color="emerald"
                />
                <KpiCard
                    title="Customers"
                    value={stats.customers_total}
                    subtitle={`+${stats.customers_new_period} this period`}
                    icon={Users}
                    trend={trends.customers}
                    trendLabel={trendLabel}
                    color="sky"
                />
                <KpiCard
                    title="Pending Orders"
                    value={stats.pending_orders}
                    icon={Inbox}
                    trend={trends.pending_orders}
                    trendLabel={trendLabel}
                    color="amber"
                />
                <KpiCard
                    title="Conversion"
                    value={`${stats.conversion_rate}%`}
                    icon={TrendingUp}
                    color="secondary"
                />
            </div>

            {/* Quick actions */}
            {quickActions.length > 0 && (
                <div className="admin-card p-4 sm:p-5 mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick actions</p>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                        {quickActions.map((action, index) => {
                            const Icon = quickActionIcons[action.icon] ?? Plus;
                            const useBrand = index === 0;
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex items-center gap-3 shrink-0 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/40 hover:border-primary/40 hover:bg-primary/5 transition-premium group"
                                >
                                    <div
                                        className={clsx(
                                            'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm',
                                            !useBrand && 'bg-slate-600',
                                        )}
                                        style={useBrand ? {
                                            background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
                                        } : undefined}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 pr-1">{action.label}</span>
                                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="admin-card p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Sales Overview</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{periodLabel}</p>
                        </div>
                        <span className="text-xs font-medium text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                            {dateRange?.from} – {dateRange?.to}
                        </span>
                    </div>
                    <SalesChart data={daily} />
                </div>

                <div className="admin-card p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Order Status</h3>
                    <p className="text-xs text-slate-500 mb-4">{periodLabel}</p>
                    <DonutChart data={ordersByStatus} />
                </div>
            </div>

            {/* Orders + sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="admin-card xl:col-span-2 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Recent Orders</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Latest transactions across your store</p>
                        </div>
                        <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:opacity-80 inline-flex items-center gap-1">
                            View all <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    {recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/80">
                                        <th className="px-6 py-3">Order</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-6 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            role="link"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                if (e.target.closest('button, a, select, input')) return;
                                                router.visit(`/admin/orders/${order.id}`);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key !== 'Enter' && e.key !== ' ') return;
                                                if (e.target.closest('button, a, select, input')) return;
                                                e.preventDefault();
                                                router.visit(`/admin/orders/${order.id}`);
                                            }}
                                            className="hover:bg-primary/[0.03] dark:hover:bg-primary/5 cursor-pointer transition-premium"
                                        >
                                            <td className="px-6 py-3.5">
                                                <p className="font-semibold text-slate-900 dark:text-white">{order.order_number}</p>
                                                {order.created_at_label && (
                                                    <p className="text-xs text-slate-400 mt-0.5">{order.created_at_label}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <p className="text-slate-600 dark:text-slate-400">{order.customer_name}</p>
                                                {order.customer_email && (
                                                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{order.customer_email}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <Badge variant={statusVariant[order.status] || 'default'}>{order.status_label}</Badge>
                                            </td>
                                            <td className="px-6 py-3.5 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(order.total)}</td>
                                            <td className="px-6 py-3.5">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="p-2 rounded-lg hover:bg-primary/10 text-primary inline-flex transition-premium"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6">
                            <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 text-sm">No orders yet. Share your store to get started.</p>
                            <Link href="/" target="_blank" className="inline-flex mt-3 text-sm font-semibold text-primary hover:opacity-80">
                                View storefront
                            </Link>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="admin-card p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Top Products</h3>
                        <ul className="space-y-4">
                            {topProducts.length ? topProducts.map((product, i) => (
                                <li key={product.product_id || i}>
                                    <div className="flex justify-between gap-2 mb-1.5">
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{product.name}</span>
                                        <span className="text-xs font-semibold text-slate-500 shrink-0">{product.quantity} sold</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(product.quantity / maxProductQty) * 100}%`,
                                                background: 'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary))',
                                            }}
                                        />
                                    </div>
                                </li>
                            )) : (
                                <p className="text-sm text-slate-400">No sales data yet.</p>
                            )}
                        </ul>
                    </div>

                    {storeStats.length > 0 && (
                        <div className="admin-card p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Store Health</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {storeStats.map((item) => {
                                    const Icon = storeStatIcons[item.icon] ?? Package;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/40 hover:border-primary/30 hover:bg-primary/5 transition-premium group"
                                        >
                                            <Icon size={16} className="text-primary mb-2" />
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
