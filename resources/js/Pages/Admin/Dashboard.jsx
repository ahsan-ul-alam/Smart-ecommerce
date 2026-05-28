import { Link, router } from '@inertiajs/react';
import clsx from 'clsx';
import {
    ShoppingCart, DollarSign, Users, Package, TrendingUp, Eye,
    Plus, Store, Tag, BarChart3, Inbox, Star, Mail, RotateCcw, AlertTriangle,
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

const quickActionColors = {
    indigo: 'bg-indigo-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        {stats.orders_today} orders today · {formatCurrency(stats.revenue_today)} revenue today
                    </p>
                </div>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => setPeriod(p.value)}
                            className={clsx(
                                'px-3.5 py-2 rounded-lg text-xs font-semibold transition-premium',
                                period === p.value
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 lg:gap-5 mb-6">
                <KpiCard
                    title="Orders"
                    value={stats.orders_period}
                    icon={ShoppingCart}
                    trend={trends.orders}
                    trendLabel={trendLabel}
                    sparkData={sparklines.orders}
                    sparkKey="orders"
                    color="indigo"
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
                    color="violet"
                />
            </div>

            {quickActions.length > 0 && (
                <div className={clsx(
                    'grid gap-3 mb-6',
                    quickActions.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                )}>
                    {quickActions.map((action) => {
                        const Icon = quickActionIcons[action.icon] ?? Plus;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="admin-card p-4 flex flex-col items-center gap-2 text-center group hover:-translate-y-0.5 transition-premium"
                            >
                                <div className={clsx(
                                    'w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform',
                                    quickActionColors[action.color] ?? 'bg-indigo-500'
                                )}>
                                    <Icon size={20} />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{action.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="admin-card p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-2">
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="admin-card xl:col-span-2 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Recent Orders</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Latest transactions</p>
                        </div>
                        <Link href="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all →</Link>
                    </div>
                    {recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-700/80">
                                        <th className="px-6 py-3">Order</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-6 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-premium">
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
                                                <Link href={`/admin/orders/${order.id}`} className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 inline-flex transition-premium">
                                                    <Eye size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-16 text-sm">No orders yet.</p>
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
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                            style={{ width: `${(product.quantity / maxProductQty) * 100}%` }}
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
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Store Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {storeStats.map((item) => {
                                    const Icon = storeStatIcons[item.icon] ?? Package;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-premium group"
                                        >
                                            <Icon size={16} className="text-indigo-500 mb-2" />
                                            <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">{item.value}</p>
                                            <p className="text-xs text-slate-500">{item.label}</p>
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
