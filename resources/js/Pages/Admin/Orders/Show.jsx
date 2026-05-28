import { useForm } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import Textarea from '../../../Components/UI/Textarea';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function OrderShow({ order, statuses, paymentStatuses, couriers = [] }) {
    const statusForm = useForm({ status: order.status, note: '' });
    const paymentForm = useForm({ payment_status: order.payment_status });
    const noteForm = useForm({ admin_note: order.admin_note || '' });
    const shipmentForm = useForm({ courier: couriers[0]?.value ?? 'pathao' });

    return (
        <AdminLayout title={`Order ${order.order_number}`}>
            <FlashMessage />

            <div className="flex flex-wrap items-center gap-4 mb-4">
                <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700">
                    <ArrowLeft size={16} /> Back to orders
                </Link>
                {order.source === 'pos' ? (
                    <Link href={`/admin/pos/receipt/${order.id}`} className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline">
                        <Printer size={16} /> Print receipt
                    </Link>
                ) : (
                    <Link href={`/admin/orders/${order.id}/invoice`} className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline">
                        <Printer size={16} /> Print invoice
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader title="Order Items" />
                        <CardBody className="p-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-slate-500">
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">SKU</th>
                                        <th className="px-6 py-3">Qty</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-3 font-medium">{item.product_name}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-slate-400">{item.product_sku}</td>
                                            <td className="px-6 py-3">{item.quantity}</td>
                                            <td className="px-6 py-3">{formatPrice(item.unit_price)}</td>
                                            <td className="px-6 py-3 text-right font-medium">{formatPrice(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Shipping Address" />
                        <CardBody className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                            <p className="font-medium text-slate-800 dark:text-white">{order.shipping_address?.name}</p>
                            <p>{order.shipping_address?.phone}</p>
                            <p>{order.shipping_address?.address_line_1}</p>
                            {order.shipping_address?.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                            <p>{order.shipping_address?.city}, {order.shipping_address?.district}</p>
                            {order.customer_note && <p className="mt-2 text-slate-500">Note: {order.customer_note}</p>}
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Status Timeline" />
                        <CardBody>
                            <div className="space-y-3">
                                {order.status_histories?.map((h, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="font-medium capitalize">{h.status_label}</p>
                                            {h.note && <p className="text-slate-500">{h.note}</p>}
                                            <p className="text-xs text-slate-400">{new Date(h.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader title="Summary" />
                        <CardBody className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                            {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>}
                            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping_amount)}</span></div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-teal-700">{formatPrice(order.total)}</span></div>
                            {order.coupon_code && <p className="text-xs text-slate-400">Coupon: {order.coupon_code}</p>}
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Update Status" />
                        <CardBody>
                            <form onSubmit={(e) => { e.preventDefault(); statusForm.patch(`/admin/orders/${order.id}/status`); }} className="space-y-3">
                                <Select label="Status" value={statusForm.data.status} onChange={(e) => statusForm.setData('status', e.target.value)}
                                    options={statuses.map((s) => ({ value: s.value, label: s.label }))} />
                                <Textarea label="Note" value={statusForm.data.note} onChange={(e) => statusForm.setData('note', e.target.value)} rows={2} />
                                <Button type="submit" loading={statusForm.processing} className="w-full">Update Status</Button>
                            </form>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Payment" />
                        <CardBody>
                            <form onSubmit={(e) => { e.preventDefault(); paymentForm.patch(`/admin/orders/${order.id}/payment`); }} className="space-y-3">
                                <Select value={paymentForm.data.payment_status} onChange={(e) => paymentForm.setData('payment_status', e.target.value)}
                                    options={paymentStatuses.map((s) => ({ value: s.value, label: s.label }))} />
                                <Button type="submit" variant="secondary" loading={paymentForm.processing} className="w-full">Update Payment</Button>
                            </form>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Shipment" />
                        <CardBody>
                            {order.shipment ? (
                                <div className="text-sm space-y-1">
                                    <p><span className="text-slate-500">Courier:</span> {order.shipment.courier}</p>
                                    <p><span className="text-slate-500">Tracking:</span> {order.shipment.tracking_id || '—'}</p>
                                    <p><span className="text-slate-500">Status:</span> {order.shipment.status}</p>
                                </div>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); shipmentForm.post(`/admin/orders/${order.id}/shipment`); }} className="space-y-3">
                                    <Select
                                        label="Courier"
                                        value={shipmentForm.data.courier}
                                        onChange={(e) => shipmentForm.setData('courier', e.target.value)}
                                        options={couriers}
                                    />
                                    <Button type="submit" loading={shipmentForm.processing} className="w-full">Create Shipment</Button>
                                </form>
                            )}
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Admin Note" />
                        <CardBody>
                            <form onSubmit={(e) => { e.preventDefault(); noteForm.patch(`/admin/orders/${order.id}/note`); }}>
                                <Textarea value={noteForm.data.admin_note} onChange={(e) => noteForm.setData('admin_note', e.target.value)} rows={3} />
                                <Button type="submit" variant="secondary" loading={noteForm.processing} className="w-full mt-2">Save Note</Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
