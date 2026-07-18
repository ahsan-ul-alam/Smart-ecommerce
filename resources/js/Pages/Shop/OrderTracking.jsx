import { useForm } from '@inertiajs/react';
import {
    PackageSearch, CheckCircle2, Circle, Truck, XCircle, RotateCcw, MapPin, CreditCard,
} from 'lucide-react';
import clsx from 'clsx';
import ShopLayout from '../../Layouts/ShopLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import Badge from '../../Components/UI/Badge';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n ?? 0).toLocaleString('en-BD')}`;

const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString('en-BD', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

const NEGATIVE = {
    cancelled: { label: 'Cancelled', icon: XCircle, tone: 'text-red-500', badge: 'danger' },
    returned: { label: 'Returned', icon: RotateCcw, tone: 'text-amber-500', badge: 'warning' },
    refunded: { label: 'Refunded', icon: RotateCcw, tone: 'text-amber-500', badge: 'warning' },
};

export default function OrderTracking({ order = null, workflow = [], prefillOrder = '' }) {
    const form = useForm({
        order_number: prefillOrder || '',
        contact: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/shop/track', { preserveScroll: true });
    };

    // Map each reached workflow status to when it happened (from status history).
    const historyByStatus = {};
    (order?.status_histories ?? []).forEach((h) => {
        if (!historyByStatus[h.status]) historyByStatus[h.status] = h.created_at;
    });

    const currentIndex = order ? workflow.findIndex((s) => s.value === order.status) : -1;
    const negative = order ? NEGATIVE[order.status] : null;

    return (
        <ShopLayout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <div className="text-center mb-8">
                    <PackageSearch size={44} className="mx-auto text-primary mb-3" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Track your order</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Enter your order number and the email or phone you used at checkout.
                    </p>
                </div>

                <Card className="mb-8">
                    <CardBody>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
                            <Input
                                label="Order number"
                                value={form.data.order_number}
                                onChange={(e) => form.setData('order_number', e.target.value)}
                                placeholder="AC-250718-A1B2C3"
                                error={form.errors.order_number}
                                required
                            />
                            <Input
                                label="Email or phone"
                                value={form.data.contact}
                                onChange={(e) => form.setData('contact', e.target.value)}
                                placeholder="you@example.com"
                                error={form.errors.contact}
                                required
                            />
                            <Button type="submit" loading={form.processing} className="sm:mb-0.5">Track</Button>
                        </form>
                    </CardBody>
                </Card>

                {order && (
                    <div className="space-y-6">
                        {/* Summary header */}
                        <Card>
                            <CardBody className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs text-slate-500">Order number</p>
                                    <p className="font-mono font-bold text-primary">{order.order_number}</p>
                                    <p className="text-xs text-slate-400 mt-1">Placed {formatDate(order.created_at)}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={negative ? negative.badge : 'info'}>{order.status_label}</Badge>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{formatPrice(order.total)}</p>
                                    <p className="text-xs text-slate-400">{order.payment_status_label} · {order.payment_method_label}</p>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Status timeline */}
                        <Card>
                            <CardHeader title="Order status" />
                            <CardBody>
                                {negative ? (
                                    <div className={clsx('flex items-center gap-3', negative.tone)}>
                                        <negative.icon size={28} />
                                        <div>
                                            <p className="font-semibold">{negative.label}</p>
                                            <p className="text-sm text-slate-500">{formatDate(historyByStatus[order.status]) || 'This order is no longer in progress.'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <ol className="relative">
                                        {workflow.map((step, i) => {
                                            const reached = i <= currentIndex;
                                            const isCurrent = i === currentIndex;
                                            const Icon = step.value === 'shipped' ? Truck : reached ? CheckCircle2 : Circle;
                                            const at = formatDate(historyByStatus[step.value]);
                                            return (
                                                <li key={step.value} className="flex gap-4 pb-6 last:pb-0">
                                                    <div className="flex flex-col items-center">
                                                        <Icon
                                                            size={24}
                                                            className={clsx(
                                                                'shrink-0',
                                                                reached ? 'text-primary' : 'text-slate-300 dark:text-slate-600',
                                                                isCurrent && 'animate-pulse',
                                                            )}
                                                        />
                                                        {i < workflow.length - 1 && (
                                                            <span className={clsx('w-0.5 flex-1 mt-1', i < currentIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700')} />
                                                        )}
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <p className={clsx('font-semibold text-sm', reached ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
                                                            {step.label}
                                                        </p>
                                                        {at && <p className="text-xs text-slate-400 mt-0.5">{at}</p>}
                                                        {isCurrent && <p className="text-xs text-primary mt-0.5">Current status</p>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                )}

                                {order.shipment?.tracking_id && (
                                    <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700/70 text-sm">
                                        <p className="text-slate-500">Courier</p>
                                        <p className="font-medium">
                                            {order.shipment.courier || 'Courier'} — <span className="font-mono">{order.shipment.tracking_id}</span>
                                        </p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Items */}
                        <Card>
                            <CardHeader title={`Items (${order.items_count ?? order.items?.length ?? 0})`} />
                            <CardBody className="space-y-3">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.product_name}</p>
                                            {item.variant_name && <p className="text-xs text-slate-400">{item.variant_name}</p>}
                                            <p className="text-xs text-slate-500">Qty {item.quantity} × {formatPrice(item.unit_price)}</p>
                                        </div>
                                        <p className="text-sm font-semibold">{formatPrice(item.total)}</p>
                                    </div>
                                ))}

                                <div className="border-t border-slate-200/70 dark:border-slate-700/70 pt-3 space-y-1 text-sm">
                                    <Row label="Subtotal" value={formatPrice(order.subtotal)} />
                                    {order.discount_amount > 0 && <Row label="Discount" value={`- ${formatPrice(order.discount_amount)}`} />}
                                    <Row label="Shipping" value={formatPrice(order.shipping_amount)} />
                                    {order.tax_amount > 0 && <Row label="Tax" value={formatPrice(order.tax_amount)} />}
                                    <div className="flex justify-between font-bold pt-1">
                                        <span>Total</span>
                                        <span className="text-primary">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Shipping + payment */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {order.shipping_address && (
                                <Card>
                                    <CardHeader title="Shipping to" />
                                    <CardBody className="text-sm text-slate-600 dark:text-slate-300 space-y-0.5">
                                        <p className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                                            <MapPin size={14} /> {order.shipping_address.name || order.customer_name}
                                        </p>
                                        {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                                        {order.shipping_address.local_address && <p>{order.shipping_address.local_address}</p>}
                                        <p>
                                            {[order.shipping_address.thana, order.shipping_address.district, order.shipping_address.division]
                                                .filter(Boolean).join(', ')}
                                        </p>
                                    </CardBody>
                                </Card>
                            )}
                            <Card>
                                <CardHeader title="Payment" />
                                <CardBody className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    <p className="flex items-center gap-1.5">
                                        <CreditCard size={14} /> {order.payment_method_label}
                                    </p>
                                    <p>Status: <Badge variant={order.payment_status === 'paid' ? 'success' : 'default'}>{order.payment_status_label}</Badge></p>
                                    {order.coupon_code && <p className="text-xs text-slate-400">Coupon: {order.coupon_code}</p>}
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between text-slate-500">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
