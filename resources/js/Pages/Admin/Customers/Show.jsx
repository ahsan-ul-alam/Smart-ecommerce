import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatShippingAddress } from '../../../utils/formatShippingAddress';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import Textarea from '../../../Components/UI/Textarea';
import Input from '../../../Components/UI/Input';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

const statusVariant = {
    pending: 'warning', confirmed: 'info', delivered: 'success', cancelled: 'default',
};

export default function CustomerShow({ customer, orders, statuses, addresses }) {
    const [walletAmount, setWalletAmount] = useState('');
    const [loyaltyPoints, setLoyaltyPoints] = useState('');

    const form = useForm({
        status: customer.status,
        customer_notes: customer.customer_notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.patch(`/admin/customers/${customer.id}`);
    };

    return (
        <AdminLayout title={customer.name}>
            <FlashMessage />

            <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-4">
                <ArrowLeft size={16} /> Back to customers
            </Link>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader title="Order History" subtitle={`${customer.orders_count} total orders`} />
                        <CardBody className="p-0 overflow-x-auto">
                            {orders.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-slate-500">
                                            <th className="px-6 py-3">Order</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-3">
                                                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-teal-700 hover:underline">
                                                        {order.order_number}
                                                    </Link>
                                                    <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <Badge variant={statusVariant[order.status] || 'default'}>{order.status_label}</Badge>
                                                </td>
                                                <td className="px-6 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-slate-400 py-8 text-sm">No orders yet</p>
                            )}
                        </CardBody>
                    </Card>

                    {addresses.length > 0 && (
                        <Card>
                            <CardHeader title="Saved Addresses" />
                            <CardBody className="space-y-3">
                                {addresses.map((a) => (
                                    <div key={a.id} className="text-sm border-b last:border-0 pb-3 last:pb-0">
                                        <p className="font-medium">{a.name} {a.is_default && <Badge variant="info">Default</Badge>}</p>
                                        <p className="text-slate-500">{a.phone}</p>
                                        <p className="text-slate-600 dark:text-slate-300">{formatShippingAddress(a).single}</p>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader title="Profile" />
                        <CardBody className="space-y-2 text-sm">
                            <p><span className="text-slate-500">Email:</span> {customer.email}</p>
                            <p><span className="text-slate-500">Phone:</span> {customer.phone || '—'}</p>
                            <p><span className="text-slate-500">Joined:</span> {new Date(customer.created_at).toLocaleDateString()}</p>
                            {customer.provider && <p><span className="text-slate-500">Signed up via:</span> {customer.provider}</p>}
                            <p><span className="text-slate-500">Total spent:</span> <strong>{formatPrice(customer.total_spent)}</strong></p>
                            <p><span className="text-slate-500">Wishlist items:</span> {customer.wishlists_count}</p>
                            <p><span className="text-slate-500">Loyalty points:</span> <strong>{customer.loyalty_points}</strong></p>
                            <p><span className="text-slate-500">Wallet:</span> <strong>{formatPrice(customer.wallet_balance)}</strong></p>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Credit Wallet" />
                        <CardBody>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                router.post(`/admin/customers/${customer.id}/wallet`, { amount: walletAmount, description: 'Admin credit' });
                            }} className="space-y-3">
                                <Input label="Amount (৳)" type="number" min="1" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} required />
                                <Button type="submit" className="w-full">Add to Wallet</Button>
                            </form>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Affiliate Program" />
                        <CardBody className="space-y-3">
                            <p className="text-sm text-slate-600">
                                {customer.is_affiliate ? (
                                <>Code: <span className="font-mono text-teal-700">{customer.affiliate_code || '—'}</span></>
                                ) : 'Not an affiliate yet.'}
                            </p>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => router.patch(`/admin/customers/${customer.id}/affiliate`, {
                                    is_affiliate: !customer.is_affiliate,
                                })}
                            >
                                {customer.is_affiliate ? 'Disable affiliate' : 'Enable as affiliate'}
                            </Button>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Adjust Points" />
                        <CardBody>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                router.post(`/admin/customers/${customer.id}/loyalty`, { points: loyaltyPoints, description: 'Admin adjustment' });
                            }} className="space-y-3">
                                <Input label="Points (+/-)" type="number" value={loyaltyPoints} onChange={(e) => setLoyaltyPoints(e.target.value)} required />
                                <Button type="submit" variant="secondary" className="w-full">Adjust Points</Button>
                            </form>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Manage Customer" />
                        <CardBody>
                            <form onSubmit={submit} className="space-y-4">
                                <Select
                                    label="Status"
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    options={statuses.map((s) => ({ value: s.value, label: s.label }))}
                                />
                                <Textarea
                                    label="Admin Notes"
                                    value={form.data.customer_notes}
                                    onChange={(e) => form.setData('customer_notes', e.target.value)}
                                    rows={4}
                                />
                                <Button type="submit" loading={form.processing} className="w-full">Save</Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
