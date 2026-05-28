import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Eye, Download, Truck } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody } from '../../../Components/UI/Card';
import clsx from 'clsx';

const statusVariant = {
    pending: 'warning', confirmed: 'info', processing: 'info',
    packed: 'info', shipped: 'info', delivered: 'success',
    cancelled: 'danger', returned: 'default', refunded: 'default',
};

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

function QuickShip({ order, couriers }) {
    const [courier, setCourier] = useState(couriers[0]?.value ?? 'pathao');

    if (order.shipment?.tracking_id) {
        return (
            <span className="text-xs text-slate-500">
                {order.shipment.courier} · {order.shipment.tracking_id}
            </span>
        );
    }

    const ship = () => {
        router.post(`/admin/orders/${order.id}/shipment`, { courier }, { preserveScroll: true });
    };

    return (
        <div className="flex items-center gap-1 min-w-[140px]">
            <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-1 py-1 max-w-[90px]"
            >
                {couriers.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                ))}
            </select>
            <button type="button" onClick={ship} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100" title="Create shipment">
                <Truck size={14} />
            </button>
        </div>
    );
}

export default function OrdersIndex({ orders = { data: [], links: [], meta: { last_page: 1 } }, filters = {}, statuses = [], sources = [], couriers = [] }) {
    const rows = Array.isArray(orders?.data) ? orders.data : [];
    const statusOptions = Array.isArray(statuses) ? statuses : Object.values(statuses ?? {});

    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/orders', Object.fromEntries(form), { preserveState: true });
    };

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.payment_status) params.set('payment_status', filters.payment_status);
        if (filters.source) params.set('source', filters.source);
        const qs = params.toString();
        return `/admin/orders/export${qs ? `?${qs}` : ''}`;
    };

    return (
        <AdminLayout title="Orders">
            <FlashMessage />

            <form onSubmit={search} className="flex flex-wrap gap-2 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="search" defaultValue={filters.search || ''} placeholder="Order #, name, phone..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <Select name="status" defaultValue={filters.status || ''} placeholder="All statuses"
                    options={[{ value: '', label: 'All statuses' }, ...statusOptions.map((s) => ({ value: s.value, label: s.label }))]} className="w-40" />
                <Select name="source" defaultValue={filters.source || ''} placeholder="All channels"
                    options={sources.map((s) => ({ value: s.value, label: s.label }))} className="w-36" />
                <Button type="submit" variant="secondary">Filter</Button>
                <a href={exportUrl()} className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Download size={16} /> Export CSV
                </a>
            </form>

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500">
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Channel</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Courier</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Payment</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {rows.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-xs font-medium text-teal-700">{order.order_number}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={order.source === 'pos' ? 'info' : 'default'}>{order.source === 'pos' ? 'POS' : 'Online'}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800 dark:text-white">{order.customer_name}</p>
                                        <p className="text-xs text-slate-400">{order.guest_phone || order.user?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <QuickShip order={order} couriers={couriers} />
                                    </td>
                                    <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs">{order.payment_method_label}</p>
                                        <p className={clsx('text-xs capitalize', order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600')}>
                                            {order.payment_status}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusVariant[order.status]}>{order.status_label}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {new Date(order.created_at).toLocaleDateString('en-BD')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${order.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg inline-flex">
                                            <Eye size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!rows.length && (
                                <tr><td colSpan={9} className="px-6 py-16 text-center text-slate-400">No orders yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
            <Pagination links={orders.links} meta={orders.meta} />
        </AdminLayout>
    );
}
