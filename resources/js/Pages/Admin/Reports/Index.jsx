import { router } from '@inertiajs/react';
import clsx from 'clsx';
import { DollarSign, ShoppingCart, TrendingUp, Users, Truck } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import KpiCard from '../../../Components/Admin/KpiCard';
import SalesChart from '../../../Components/Admin/SalesChart';
import SimpleBarChart from '../../../Components/UI/SimpleBarChart';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function ReportsIndex({ report, period, periods }) {
    const {
        summary, daily, orders_by_status, payment_methods, top_products,
        sales_by_source = [], delivery = {},
    } = report;

    const changePeriod = (value) => {
        router.get('/admin/reports', { period: value }, { preserveState: true });
    };

    const periodLabel = periods.find((p) => p.value === period)?.label ?? 'Period';

    return (
        <AdminLayout title="Reports & Analytics">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reports</h2>
                    <p className="text-slate-500 mt-1 text-sm">{periodLabel} · sales & delivery insights</p>
                </div>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit flex-wrap">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => changePeriod(p.value)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <KpiCard title="Total Revenue" value={formatPrice(summary.revenue)} icon={DollarSign} color="emerald" subtitle={summary.conversion_note} />
                <KpiCard title="Paid Revenue" value={formatPrice(summary.paid_revenue)} icon={TrendingUp} color="indigo" />
                <KpiCard title="Orders" value={summary.orders} icon={ShoppingCart} color="sky" subtitle={`AOV ${formatPrice(summary.avg_order_value)}`} />
                <KpiCard title="Customers" value={summary.customers} icon={Users} color="violet" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <div className="admin-card p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Revenue over time</h3>
                    <SalesChart data={daily} />
                </div>
                <div className="admin-card p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Orders per day</h3>
                    <SimpleBarChart
                        data={daily.slice(-14).map((d) => ({ label: d.label, value: d.orders }))}
                        color="bg-indigo-500"
                    />
                </div>
            </div>

            {sales_by_source.length > 0 && (
                <div className="admin-card p-6 mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Sales by channel</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sales_by_source.map((row) => (
                            <div key={row.source} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm text-slate-500">{row.label}</p>
                                <p className="text-2xl font-bold text-indigo-600 mt-1">{formatPrice(row.revenue)}</p>
                                <p className="text-xs text-slate-400 mt-1">{row.orders} orders</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(delivery.total_shipments > 0 || delivery.by_courier?.length > 0) && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <KpiCard title="Shipments" value={delivery.total_shipments ?? 0} icon={Truck} color="sky" />
                        <KpiCard title="Failed deliveries" value={delivery.failed_deliveries ?? 0} icon={Truck} color="amber" />
                        <KpiCard title="Couriers" value={delivery.by_courier?.length ?? 0} icon={Truck} color="violet" />
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                        {delivery.by_courier?.length > 0 && (
                            <div className="admin-card p-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Courier reports</h3>
                                <SimpleBarChart data={delivery.by_courier.map((c) => ({ label: c.label, value: c.count }))} color="bg-indigo-500" />
                            </div>
                        )}
                        {delivery.by_status?.length > 0 && (
                            <div className="admin-card p-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Delivery status</h3>
                                <SimpleBarChart data={delivery.by_status.map((s) => ({ label: s.label, value: s.count }))} color="bg-sky-500" />
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="admin-card p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Orders by status</h3>
                    <SimpleBarChart data={orders_by_status.map((s) => ({ label: s.label, value: s.count }))} color="bg-violet-500" />
                </div>
                <div className="admin-card p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Payment methods</h3>
                    <SimpleBarChart data={payment_methods.map((p) => ({ label: p.label, value: p.count }))} color="bg-amber-500" />
                </div>
                <div className="admin-card p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Revenue by payment</h3>
                    <SimpleBarChart data={payment_methods.map((p) => ({ label: p.label, value: p.revenue }))} formatValue={formatPrice} color="bg-emerald-500" />
                </div>
            </div>

            <div className="admin-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80">
                    <h3 className="font-bold text-slate-900 dark:text-white">Top selling products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-700/80">
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Qty</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {top_products.length ? top_products.map((p) => (
                                <tr key={p.product_id}>
                                    <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                    <td className="px-6 py-3.5">{p.quantity}</td>
                                    <td className="px-6 py-3.5 text-right font-bold">{formatPrice(p.revenue)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No sales data yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
