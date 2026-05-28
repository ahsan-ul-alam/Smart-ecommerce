import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';
import Button from '../../../Components/UI/Button';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;
const formatDate = (d) => new Date(d).toLocaleString('en-BD');

export default function OrderInvoice({ order, store, backUrl }) {
    const returnUrl = backUrl || `/admin/orders/${order.id}`;

    useEffect(() => {
        document.title = `Invoice ${order.order_number}`;
    }, [order.order_number]);

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white">
            <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

            <div className="no-print max-w-2xl mx-auto px-4 py-6 flex justify-between items-center">
                <Link href={returnUrl} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-teal-700">
                    <ArrowLeft size={16} /> Back
                </Link>
                <Button onClick={() => window.print()}><Printer size={16} /> Print invoice</Button>
            </div>

            <div className="max-w-2xl mx-auto bg-white shadow-lg print:shadow-none rounded-lg print:rounded-none p-8 my-4 print:my-0 text-slate-900">
                <div className="flex justify-between items-start border-b pb-6 mb-6">
                    <div>
                        {store.logo && (
                            <img src={store.logo} alt={store.name} className="h-12 mb-3 object-contain" />
                        )}
                        <h1 className="text-2xl font-bold text-teal-800">{store.name}</h1>
                        {store.address && <p className="text-sm text-slate-500 mt-1">{store.address}</p>}
                        {store.phone && <p className="text-sm text-slate-500">{store.phone}</p>}
                        {store.email && <p className="text-sm text-slate-500">{store.email}</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">INVOICE</p>
                        <p className="font-mono text-sm mt-1">{order.order_number}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatDate(order.created_at)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                    <div>
                        <p className="text-xs uppercase text-slate-400 mb-1">Bill to</p>
                        <p className="font-medium">{order.customer_name || order.guest_name}</p>
                        {order.guest_email && <p className="text-slate-500">{order.guest_email}</p>}
                        {order.guest_phone && <p className="text-slate-500">{order.guest_phone}</p>}
                    </div>
                    <div>
                        <p className="text-xs uppercase text-slate-400 mb-1">Payment</p>
                        <p className="capitalize">{order.payment_method_label || order.payment_method}</p>
                        <p className="capitalize text-slate-500">{order.payment_status}</p>
                        <p className="capitalize text-slate-500 mt-1">Status: {order.status_label || order.status}</p>
                    </div>
                </div>

                <table className="w-full text-sm mb-6">
                    <thead>
                        <tr className="border-b bg-slate-50">
                            <th className="text-left py-2 px-2">Product</th>
                            <th className="text-center py-2">Qty</th>
                            <th className="text-right py-2">Unit</th>
                            <th className="text-right py-2 px-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-2 px-2">
                                    {item.product_name}
                                    {item.variant_name && <span className="text-slate-500"> ({item.variant_name})</span>}
                                </td>
                                <td className="text-center py-2">{item.quantity}</td>
                                <td className="text-right py-2">{formatPrice(item.unit_price)}</td>
                                <td className="text-right py-2 px-2">{formatPrice(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t pt-4 space-y-1 text-sm max-w-xs ml-auto">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                    {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>}
                    {order.shipping_amount > 0 && <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping_amount)}</span></div>}
                    {order.tax_amount > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.tax_amount)}</span></div>}
                    <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-teal-700">{formatPrice(order.total)}</span></div>
                </div>

                {order.shipping_address && (
                    <div className="mt-8 text-sm border-t pt-4">
                        <p className="text-xs uppercase text-slate-400 mb-1">Ship to</p>
                        <p className="font-medium">{order.shipping_address.name}</p>
                        <p>{order.shipping_address.address_line_1}</p>
                        <p>{order.shipping_address.city}, {order.shipping_address.district}</p>
                        <p>{order.shipping_address.phone}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
