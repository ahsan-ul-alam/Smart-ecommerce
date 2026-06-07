import { Link } from '@inertiajs/react';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { formatShippingAddress } from '../../../utils/formatShippingAddress';
import { formatPrice, formatDate, initials } from './orderUtils';

export default function OrderCustomerCard({ order }) {
    const address = order.shipping_address;
    const insights = order.customer_insights;

    return (
        <div className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Customer Information</h2>
            </div>
            <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
                    >
                        {initials(order.customer_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white text-lg">{order.customer_name}</p>
                        <div className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                            {order.customer_phone && (
                                <p className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-400 shrink-0" />
                                    <a href={`tel:${order.customer_phone}`} className="hover:text-primary transition-premium">{order.customer_phone}</a>
                                </p>
                            )}
                            {order.customer_email && (
                                <p className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-400 shrink-0" />
                                    <a href={`mailto:${order.customer_email}`} className="hover:text-primary transition-premium truncate">{order.customer_email}</a>
                                </p>
                            )}
                            {address && (
                                <div className="flex items-start gap-2 pt-1">
                                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        {formatShippingAddress(address).lines.map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {order.customer_note && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-sm text-amber-800 dark:text-amber-300">
                        <span className="font-semibold">Customer note:</span> {order.customer_note}
                    </div>
                )}

                {insights && (
                    <div className="mt-5 grid grid-cols-3 gap-3 pt-5 border-t border-slate-100 dark:border-slate-700/80">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Orders</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{insights.orders_count}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Spending</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{formatPrice(insights.total_spent)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Last Order</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(insights.last_order_at)}</p>
                        </div>
                    </div>
                )}

                {order.user?.id && (
                    <Link
                        href={`/admin/customers/${order.user.id}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-premium"
                    >
                        View Customer Profile <ExternalLink size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
}
