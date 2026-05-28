import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, DollarSign, Users, Package, BarChart3 } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import StatCard from '../../Components/UI/StatCard';
import Badge from '../../Components/UI/Badge';
import Button from '../../Components/UI/Button';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

const formatCurrency = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

const statusVariant = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    delivered: 'success',
    shipped: 'info',
    cancelled: 'default',
};

export default function Dashboard({ stats, recentOrders = [] }) {
    const { t } = useTranslation();

    return (
        <AdminLayout title={t('dashboard.title')}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-slate-500 dark:text-slate-400">{t('dashboard.welcome')}</p>
                <Link href="/admin/reports">
                    <Button variant="secondary"><BarChart3 size={16} /> View Reports</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard title={t('dashboard.orders_today')} value={stats.orders_today} icon={ShoppingCart} color="teal" />
                <StatCard title={t('dashboard.revenue_today')} value={formatCurrency(stats.revenue_today)} icon={DollarSign} color="amber" />
                <StatCard title="Revenue (This Month)" value={formatCurrency(stats.revenue_month)} icon={DollarSign} color="purple" />
                <StatCard title={t('dashboard.products')} value={stats.products_total} icon={Package} color="blue" trend={`${stats.products_published} published · ${stats.customers_total} customers`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Recent Orders" subtitle="Latest transactions" />
                    <CardBody className="p-0">
                        {recentOrders.length > 0 ? (
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-3">
                                                <Link href={`/admin/orders/${order.id}`} className="font-medium text-teal-700 hover:underline">
                                                    {order.order_number}
                                                </Link>
                                                <p className="text-xs text-slate-400">{order.customer_name}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={statusVariant[order.status] || 'default'}>{order.status_label}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 text-slate-400 text-sm">
                                No orders yet. Place a test order from the shop or run{' '}
                                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">php artisan db:seed --class=SampleOrdersSeeder</code>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Quick Stats" subtitle="Operational overview" />
                    <CardBody className="space-y-3">
                        {[
                            ['Pending Orders', stats.pending_orders, '/admin/orders?status=pending'],
                            ['Return Requests', stats.pending_returns ?? 0, '/admin/return-requests'],
                            ['Pending Reviews', stats.pending_reviews ?? 0, '/admin/reviews'],
                            ['New Contact Messages', stats.new_contact_messages ?? 0, '/admin/contact-inquiries?status=new'],
                            ['Low Stock Products', stats.low_stock_products, '/admin/inventory'],
                            ['Abandoned Carts', stats.abandoned_carts, '/admin/abandoned-carts'],
                            ['Newsletter Subscribers', stats.newsletter_subscribers ?? 0, '/admin/newsletter'],
                            ['Total Orders', stats.total_orders ?? 0, '/admin/orders'],
                        ].map(([label, value, href]) => (
                            <div key={label} className="flex justify-between text-sm">
                                <Link href={href} className="text-slate-500 hover:text-teal-700">{label}</Link>
                                <Link href={href} className="font-semibold text-slate-800 dark:text-white hover:text-teal-700">{value}</Link>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
}
