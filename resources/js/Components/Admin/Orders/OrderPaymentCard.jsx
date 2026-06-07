import { Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Download, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import Button from '../../UI/Button';
import Select from '../../UI/Select';
import Badge from '../../UI/Badge';
import { formatPrice, paymentVariant } from './orderUtils';

export default function OrderPaymentCard({
    order,
    paymentStatuses = [],
    onRefund,
    id = 'payment-card',
}) {
    const paymentForm = useForm({ payment_status: order.payment_status });
    const txn = order.payment_transaction;
    const transactionId = txn?.trx_id ?? txn?.payment_id ?? order.payment_reference;

    return (
        <div id={id} className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Payment</h2>
                <Badge variant={paymentVariant[order.payment_status] ?? 'default'}>
                    {order.payment_status_label ?? order.payment_status}
                </Badge>
            </div>
            <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CreditCard size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{order.payment_method_label}</p>
                        <p className="text-lg font-bold text-primary">{formatPrice(order.total)}</p>
                    </div>
                </div>

                <div className="space-y-2 text-sm border-t border-slate-100 dark:border-slate-700/80 pt-4">
                    {transactionId && (
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 shrink-0">Transaction ID</span>
                            <span className="font-mono text-xs text-slate-700 dark:text-slate-200 text-right break-all">{transactionId}</span>
                        </div>
                    )}
                    {txn?.provider && (
                        <div className="flex justify-between">
                            <span className="text-slate-400">Provider</span>
                            <span className="font-medium capitalize">{txn.provider}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-slate-400">Amount Paid</span>
                        <span className={clsx('font-semibold', order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600')}>
                            {order.payment_status === 'paid' ? formatPrice(order.total) : '—'}
                        </span>
                    </div>
                    {order.refunded_amount > 0 && (
                        <div className="flex justify-between text-red-600">
                            <span>Refunded</span>
                            <span className="font-semibold">-{formatPrice(order.refunded_amount)}</span>
                        </div>
                    )}
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        paymentForm.patch(`/admin/orders/${order.id}/payment`, { preserveScroll: true });
                    }}
                    className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/80"
                >
                    <Select
                        label="Update status"
                        value={paymentForm.data.payment_status}
                        onChange={(e) => paymentForm.setData('payment_status', e.target.value)}
                        options={paymentStatuses.map((s) => ({ value: s.value, label: s.label }))}
                    />
                    <Button type="submit" variant="secondary" loading={paymentForm.processing} className="w-full">
                        Update Payment
                    </Button>
                </form>

                <div className="flex flex-col gap-2">
                    {order.refundable_remaining > 0 && (
                        <Button type="button" variant="secondary" className="w-full" onClick={onRefund}>
                            Refund
                        </Button>
                    )}
                    {order.source !== 'pos' && (
                        <Link
                            href={`/admin/orders/${order.id}/invoice`}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-premium"
                        >
                            <Download size={15} /> Download Receipt
                        </Link>
                    )}
                    {order.payment_status !== 'paid' && order.payment_method !== 'cod' && (
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => router.post(`/admin/orders/${order.id}/retry-payment`, {}, { preserveScroll: true })}
                        >
                            <RefreshCw size={15} className="inline mr-1.5" />
                            Retry Payment
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
