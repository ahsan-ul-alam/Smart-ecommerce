import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import AccountLayout from '../../../Layouts/AccountLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import Textarea from '../../../Components/UI/Textarea';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function OrderShow({ order, returnReasons = {} }) {
    const returnForm = useForm({ reason: Object.keys(returnReasons)[0] || 'defective', customer_note: '' });

    const submitReturn = (e) => {
        e.preventDefault();
        returnForm.post(`/account/orders/${order.id}/return`, { preserveScroll: true });
    };

    return (
        <AccountLayout title={`Order ${order.order_number}`}>
            <FlashMessage />
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700">
                    <ArrowLeft size={16} /> Back to orders
                </Link>
                <Link href={`/account/orders/${order.id}/invoice`} className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline">
                    <Printer size={16} /> Download invoice
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader title="Items" />
                        <CardBody className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.product_name} × {item.quantity}</span>
                                    <span className="font-medium">{formatPrice(item.total)}</span>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader title="Delivery Address" />
                        <CardBody className="text-sm text-slate-600 space-y-1">
                            <p className="font-medium text-slate-800 dark:text-white">{order.shipping_address?.name}</p>
                            <p>{order.shipping_address?.phone}</p>
                            <p>{order.shipping_address?.address_line_1}</p>
                            <p>{order.shipping_address?.city}, {order.shipping_address?.district}</p>
                        </CardBody>
                    </Card>

                    {order.can_request_return && (
                        <Card>
                            <CardHeader title="Request a return" />
                            <CardBody>
                                <form onSubmit={submitReturn} className="space-y-3">
                                    <Select
                                        label="Reason"
                                        value={returnForm.data.reason}
                                        onChange={(e) => returnForm.setData('reason', e.target.value)}
                                        options={Object.entries(returnReasons).map(([value, label]) => ({ value, label }))}
                                    />
                                    <Textarea
                                        label="Additional details (optional)"
                                        value={returnForm.data.customer_note}
                                        onChange={(e) => returnForm.setData('customer_note', e.target.value)}
                                        rows={3}
                                    />
                                    <Button type="submit" loading={returnForm.processing}>Submit return request</Button>
                                </form>
                            </CardBody>
                        </Card>
                    )}

                    {order.return_request && (
                        <Card>
                            <CardHeader title="Return request" />
                            <CardBody className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Status</span>
                                    <Badge>{order.return_request.status_label}</Badge>
                                </div>
                                <p><span className="text-slate-500">Reason:</span> {order.return_request.reason}</p>
                                {order.return_request.customer_note && <p>{order.return_request.customer_note}</p>}
                                {order.return_request.admin_note && (
                                    <p className="text-slate-500 border-t pt-2">Store note: {order.return_request.admin_note}</p>
                                )}
                            </CardBody>
                        </Card>
                    )}
                </div>
                <Card>
                    <CardHeader title="Order Summary" />
                    <CardBody className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>Status</span><Badge>{order.status_label}</Badge></div>
                        <div className="flex justify-between"><span>Payment</span><span>{order.payment_method_label}</span></div>
                        <div className="flex justify-between border-t pt-3 font-bold"><span>Total</span><span className="text-teal-700">{formatPrice(order.total)}</span></div>
                        {order.status_histories?.map((h, i) => (
                            <div key={i} className="text-xs text-slate-400 border-t pt-2">
                                <span className="font-medium text-slate-600">{h.status_label}</span> — {new Date(h.created_at).toLocaleString()}
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>
        </AccountLayout>
    );
}
