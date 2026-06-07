import Badge from '../../UI/Badge';
import { formatPrice, paymentVariant } from './orderUtils';

export default function OrderSummaryCard({ order }) {
    return (
        <div className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Order Summary</h2>
                <Badge variant={paymentVariant[order.payment_status] ?? 'default'}>
                    {order.payment_status === 'paid' ? 'Paid' : order.payment_status_label}
                </Badge>
            </div>
            <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Shipping</span>
                    <span className="font-medium">{formatPrice(order.shipping_amount)}</span>
                </div>
                {order.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                        <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                        <span className="font-medium">-{formatPrice(order.discount_amount)}</span>
                    </div>
                )}
                {order.tax_amount > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Tax</span>
                        <span className="font-medium">{formatPrice(order.tax_amount)}</span>
                    </div>
                )}
                {order.refunded_amount > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Refunded</span>
                        <span className="font-medium">-{formatPrice(order.refunded_amount)}</span>
                    </div>
                )}

                <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-slate-200 dark:border-slate-600">
                    <span className="text-base font-semibold text-slate-800 dark:text-slate-100">Grand Total</span>
                    <span className="text-2xl font-bold text-primary tracking-tight">{formatPrice(order.total)}</span>
                </div>

                <p className="text-xs text-slate-400 pt-1">
                    via {order.payment_method_label}
                </p>
            </div>
        </div>
    );
}
