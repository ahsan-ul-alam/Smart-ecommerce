import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Store } from 'lucide-react';
import Button from '../../../Components/UI/Button';
import FlashMessage from '../../../Components/UI/FlashMessage';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;
const formatDate = (d) => new Date(d).toLocaleString('en-BD');

export default function PosReceipt({ order, store }) {
    useEffect(() => {
        document.title = `Receipt ${order.order_number}`;
    }, [order.order_number]);

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                }
            `}</style>

            <div className="no-print max-w-lg mx-auto px-4 py-6 flex flex-wrap gap-2 justify-between items-center">
                <FlashMessage />
                <Link href="/admin/pos" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-teal-700">
                    <ArrowLeft size={16} /> Back to POS
                </Link>
                <div className="flex gap-2">
                    <Button onClick={() => window.print()}><Printer size={16} /> Print receipt</Button>
                    <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="secondary">View order</Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-sm mx-auto bg-white shadow-lg print:shadow-none rounded-lg print:rounded-none p-6 my-4 print:my-0 text-slate-900 font-mono text-sm">
                <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
                    {store.logo ? (
                        <img src={store.logo} alt={store.name} className="h-12 mx-auto mb-2 object-contain" />
                    ) : (
                        <div className="flex justify-center mb-2 text-teal-700"><Store size={28} /></div>
                    )}
                    <h1 className="font-bold text-lg uppercase tracking-wide">{store.name}</h1>
                    {store.phone && <p className="text-xs mt-1">{store.phone}</p>}
                    {store.address && <p className="text-xs mt-0.5">{store.address}</p>}
                    <p className="text-xs mt-2 uppercase">Sales receipt</p>
                </div>

                <div className="space-y-1 text-xs mb-4">
                    <div className="flex justify-between"><span>Order</span><span className="font-semibold">{order.order_number}</span></div>
                    <div className="flex justify-between"><span>Date</span><span>{formatDate(order.created_at)}</span></div>
                    <div className="flex justify-between"><span>Cashier</span><span>{order.created_by?.name || 'Staff'}</span></div>
                    <div className="flex justify-between"><span>Customer</span><span>{order.guest_name || 'Walk-in'}</span></div>
                    {order.guest_phone && <div className="flex justify-between"><span>Phone</span><span>{order.guest_phone}</span></div>}
                    <div className="flex justify-between"><span>Payment</span><span className="uppercase">{order.payment_method}</span></div>
                </div>

                <table className="w-full text-xs mb-4">
                    <thead>
                        <tr className="border-b border-slate-300">
                            <th className="text-left py-1">Item</th>
                            <th className="text-center py-1">Qty</th>
                            <th className="text-right py-1">Amt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-2 pr-2">
                                    <p>{item.product_name}</p>
                                    {item.variant_name && <p className="text-slate-500">{item.variant_name}</p>}
                                </td>
                                <td className="text-center py-2">{item.quantity}</td>
                                <td className="text-right py-2">{formatPrice(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-xs">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                    {Number(order.discount_amount) > 0 && (
                        <div className="flex justify-between"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-2"><span>TOTAL</span><span>{formatPrice(order.total)}</span></div>
                </div>

                <p className="text-center text-xs mt-6 text-slate-500">Thank you for shopping with us!</p>
            </div>
        </div>
    );
}
