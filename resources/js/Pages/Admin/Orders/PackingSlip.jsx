import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Package } from 'lucide-react';
import Button from '../../../Components/UI/Button';

export default function PackingSlip({ order, store }) {
    useEffect(() => {
        document.title = `Packing ${order.order_number}`;
    }, [order.order_number]);

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white">
            <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

            <div className="no-print max-w-2xl mx-auto px-4 py-6 flex justify-between items-center">
                <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-teal-700">
                    <ArrowLeft size={16} /> Back to order
                </Link>
                <Button onClick={() => window.print()}><Printer size={16} /> Print packing slip</Button>
            </div>

            <div className="max-w-2xl mx-auto bg-white shadow-lg print:shadow-none rounded-lg print:rounded-none p-8 my-4 print:my-0 text-slate-900 border-2 border-dashed border-slate-300">
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-slate-800 mb-2">
                            <Package size={24} />
                            <span className="text-xl font-bold uppercase tracking-wide">Packing Slip</span>
                        </div>
                        {store.logo && <img src={store.logo} alt="" className="h-10 mb-2 object-contain" />}
                        <p className="font-semibold">{store.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-lg font-bold">{order.order_number}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(order.created_at).toLocaleString('en-BD')}</p>
                        {order.shipment?.tracking_id && (
                            <p className="text-xs mt-2 font-mono">Track: {order.shipment.tracking_id}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                    <div className="border border-slate-200 p-4 rounded">
                        <p className="text-xs uppercase text-slate-400 mb-2 font-semibold">Ship to</p>
                        <p className="font-bold text-base">{order.shipping_address?.name}</p>
                        <p>{order.shipping_address?.phone}</p>
                        <p className="mt-1">{order.shipping_address?.address_line_1}</p>
                        {order.shipping_address?.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                        <p className="font-medium">{order.shipping_address?.city}, {order.shipping_address?.district}</p>
                    </div>
                    <div className="border border-slate-200 p-4 rounded">
                        <p className="text-xs uppercase text-slate-400 mb-2 font-semibold">Order info</p>
                        <p>Payment: {order.payment_method_label}</p>
                        <p>Status: {order.status_label}</p>
                        {order.customer_note && <p className="mt-2 text-amber-800">Note: {order.customer_note}</p>}
                    </div>
                </div>

                <table className="w-full text-sm border border-slate-300">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                            <th className="text-left px-3 py-2 w-8">✓</th>
                            <th className="text-left px-3 py-2">SKU</th>
                            <th className="text-left px-3 py-2">Product</th>
                            <th className="text-center px-3 py-2 w-16">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item) => (
                            <tr key={item.id} className="border-b border-slate-200">
                                <td className="px-3 py-3 border border-slate-200 w-8" />
                                <td className="px-3 py-3 font-mono text-xs">{item.product_sku}</td>
                                <td className="px-3 py-3 font-medium">{item.product_name}</td>
                                <td className="px-3 py-3 text-center font-bold text-lg">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="text-xs text-slate-400 mt-6 text-center">Packed by: _________________ Date: _________________</p>
            </div>
        </div>
    );
}
