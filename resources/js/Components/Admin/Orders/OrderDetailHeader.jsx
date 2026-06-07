import { Link } from '@inertiajs/react';
import {
    ArrowLeft, Printer, Truck, MessageSquare, Banknote, RotateCcw, Mail,
} from 'lucide-react';
import clsx from 'clsx';
import Badge from '../../UI/Badge';
import { formatPrice, formatDateTime, statusVariant } from './orderUtils';

export default function OrderDetailHeader({ order, couriers = [], onAction }) {
    const courierLabel = couriers.find((c) => c.value === order.shipment?.courier)?.label
        ?? order.shipment?.courier;

    const actions = [
        order.source === 'pos'
            ? { key: 'receipt', label: 'Print Receipt', icon: Printer, href: `/admin/pos/receipt/${order.id}` }
            : { key: 'invoice', label: 'Print Invoice', icon: Printer, href: `/admin/orders/${order.id}/invoice` },
        ...(order.source !== 'pos' ? [
            { key: 'packing', label: 'Packing Slip', icon: Printer, href: `/admin/orders/${order.id}/packing-slip` },
        ] : []),
        { key: 'courier', label: 'Assign Courier', icon: Truck, action: 'courier' },
        { key: 'sms', label: 'Send SMS', icon: MessageSquare, action: 'sms' },
        { key: 'refund', label: 'Refund', icon: Banknote, action: 'refund', disabled: order.refundable_remaining <= 0 },
        { key: 'return', label: 'Return Order', icon: RotateCcw, action: 'return', disabled: !['delivered', 'shipped'].includes(order.status) },
    ];

    return (
        <section className="admin-card overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700/80">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-premium"
                    >
                        <ArrowLeft size={16} /> Orders
                    </Link>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{order.order_number}</span>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {order.order_number}
                            </h1>
                            <Badge variant={statusVariant[order.status]} className="!text-sm !px-3 !py-1">
                                {order.status_label}
                            </Badge>
                            {order.source === 'pos' && (
                                <Badge variant="info">POS</Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Placed {formatDateTime(order.created_at)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div>
                                <span className="text-slate-400">Customer</span>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{order.customer_name}</p>
                            </div>
                            {order.customer_phone && (
                                <div>
                                    <span className="text-slate-400">Phone</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{order.customer_phone}</p>
                                </div>
                            )}
                            {order.customer_email && (
                                <div>
                                    <span className="text-slate-400">Email</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{order.customer_email}</p>
                                </div>
                            )}
                            {courierLabel && (
                                <div>
                                    <span className="text-slate-400">Courier</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{courierLabel}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 text-left xl:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Order Value</p>
                        <p className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">{formatPrice(order.total)}</p>
                        <p className={clsx(
                            'text-sm font-semibold mt-1 capitalize',
                            order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600',
                        )}>
                            {order.payment_status_label ?? order.payment_status}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 sm:px-6 py-3 bg-slate-50/80 dark:bg-slate-800/40 flex flex-wrap gap-2">
                {actions.map(({ key, label, icon: Icon, href, action, disabled }) => {
                    const className = clsx(
                        'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-premium',
                        disabled
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700'
                            : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                    );

                    if (href && !disabled) {
                        return (
                            <Link key={key} href={href} target={key === 'invoice' || key === 'packing' || key === 'receipt' ? '_blank' : undefined} className={className}>
                                <Icon size={15} /> {label}
                            </Link>
                        );
                    }

                    return (
                        <button key={key} type="button" disabled={disabled} onClick={() => !disabled && onAction?.(action)} className={className}>
                            <Icon size={15} /> {label}
                        </button>
                    );
                })}
                {order.customer_email && (
                    <a
                        href={`mailto:${order.customer_email}?subject=Order ${order.order_number}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-premium"
                    >
                        <Mail size={15} /> Send Email
                    </a>
                )}
            </div>
        </section>
    );
}
