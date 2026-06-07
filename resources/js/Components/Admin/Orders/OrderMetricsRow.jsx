import {
    DollarSign, Package, CreditCard, Truck, Activity, Users,
} from 'lucide-react';
import clsx from 'clsx';
import { formatPrice, paymentVariant } from './orderUtils';
import Badge from '../../UI/Badge';

function MetricCard({ title, value, subtitle, icon: Icon, accent = 'primary' }) {
    const accents = {
        primary: 'bg-primary/10 text-primary ring-primary/20',
        emerald: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
        sky: 'bg-sky-500/10 text-sky-600 ring-sky-500/20',
        violet: 'bg-violet-500/10 text-violet-600 ring-violet-500/20',
    };

    return (
        <div className="admin-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">{value}</p>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
                </div>
                <div className={clsx('p-2 rounded-xl ring-1 shrink-0', accents[accent] ?? accents.primary)}>
                    <Icon size={18} strokeWidth={1.75} />
                </div>
            </div>
        </div>
    );
}

export default function OrderMetricsRow({ order, couriers = [] }) {
    const courierLabel = couriers.find((c) => c.value === order.shipment?.courier)?.label ?? 'Not assigned';
    const lifetimeOrders = order.customer_insights?.orders_count ?? (order.user ? 1 : '—');

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <MetricCard title="Total Amount" value={formatPrice(order.total)} icon={DollarSign} accent="primary" />
            <MetricCard
                title="Items"
                value={order.items_count ?? order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0}
                subtitle={`${order.items?.length ?? 0} line items`}
                icon={Package}
                accent="sky"
            />
            <div className="admin-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment</p>
                        <div className="mt-1.5">
                            <Badge variant={paymentVariant[order.payment_status] ?? 'default'}>
                                {order.payment_status_label ?? order.payment_status}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{order.payment_method_label}</p>
                    </div>
                    <div className="p-2 rounded-xl ring-1 bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 shrink-0">
                        <CreditCard size={18} strokeWidth={1.75} />
                    </div>
                </div>
            </div>
            <MetricCard title="Courier" value={courierLabel} subtitle={order.shipment?.tracking_id ? `Tracking: ${order.shipment.tracking_id}` : undefined} icon={Truck} accent="violet" />
            <MetricCard title="Order Status" value={order.status_label} icon={Activity} accent="amber" />
            <MetricCard
                title="Lifetime Orders"
                value={lifetimeOrders}
                subtitle={order.customer_insights ? `${formatPrice(order.customer_insights.total_spent)} spent` : 'Guest checkout'}
                icon={Users}
                accent="emerald"
            />
        </div>
    );
}
