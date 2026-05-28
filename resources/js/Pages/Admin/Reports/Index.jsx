import { router } from '@inertiajs/react';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import StatCard from '../../../Components/UI/StatCard';
import SimpleBarChart from '../../../Components/UI/SimpleBarChart';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function ReportsIndex({ report, period, periods }) {
    const { summary, daily, orders_by_status, payment_methods, top_products, sales_by_source = [] } = report;

    const changePeriod = (value) => {
        router.get('/admin/reports', { period: value }, { preserveState: true });
    };

    const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

    return (
        <AdminLayout title="Reports & Analytics">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-slate-500 dark:text-slate-400">Sales performance and operational insights</p>
                <div className="flex gap-2 flex-wrap">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => changePeriod(p.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                period === p.value
                                    ? 'bg-teal-700 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Revenue" value={formatPrice(summary.revenue)} icon={DollarSign} color="amber" trend={summary.conversion_note} />
                <StatCard title="Paid Revenue" value={formatPrice(summary.paid_revenue)} icon={TrendingUp} color="teal" />
                <StatCard title="Orders" value={summary.orders} icon={ShoppingCart} color="blue" trend={`AOV ${formatPrice(summary.avg_order_value)}`} />
                <StatCard title="Customers" value={summary.customers} icon={Users} color="purple" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader title="Revenue Over Time" subtitle="Daily totals" />
                    <CardBody>
                        {daily.length > 0 ? (
                            <div className="flex items-end gap-1 h-40">
                                {daily.map((day) => (
                                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                        <div
                                            className="w-full bg-teal-500 rounded-t hover:bg-teal-600 transition-colors"
                                            style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%` }}
                                            title={`${day.label}: ${formatPrice(day.revenue)}`}
                                        />
                                        <span className="text-[10px] text-slate-400 truncate w-full text-center">{day.label.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-12">No orders in this period</p>
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Orders Per Day" />
                    <CardBody>
                        <SimpleBarChart
                            data={daily.slice(-14).map((d) => ({ label: d.label, value: d.orders }))}
                            valueKey="value"
                            labelKey="label"
                            color="bg-blue-500"
                        />
                    </CardBody>
                </Card>
            </div>

            {sales_by_source.length > 0 && (
                <Card className="mb-6">
                    <CardHeader title="Sales by Channel" subtitle="POS vs online storefront" />
                    <CardBody>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {sales_by_source.map((row) => (
                                <div key={row.source} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-500">{row.label}</p>
                                    <p className="text-2xl font-bold text-teal-700 mt-1">{formatPrice(row.revenue)}</p>
                                    <p className="text-xs text-slate-400 mt-1">{row.orders} orders</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader title="Orders by Status" />
                    <CardBody>
                        <SimpleBarChart
                            data={orders_by_status.map((s) => ({ label: s.label, value: s.count }))}
                            color="bg-purple-500"
                        />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Payment Methods" />
                    <CardBody>
                        <SimpleBarChart
                            data={payment_methods.map((p) => ({ label: p.label, value: p.count }))}
                            formatValue={(n) => n}
                            color="bg-amber-500"
                        />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Revenue by Payment" />
                    <CardBody>
                        <SimpleBarChart
                            data={payment_methods.map((p) => ({ label: p.label, value: p.revenue }))}
                            formatValue={formatPrice}
                            color="bg-teal-600"
                        />
                    </CardBody>
                </Card>
            </div>

            <Card>
                <CardHeader title="Top Selling Products" subtitle="By quantity sold" />
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Qty Sold</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {top_products.length ? top_products.map((p) => (
                                <tr key={p.product_id}>
                                    <td className="px-6 py-3 font-medium">{p.name}</td>
                                    <td className="px-6 py-3">{p.quantity}</td>
                                    <td className="px-6 py-3 text-right font-medium">{formatPrice(p.revenue)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No sales data yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
