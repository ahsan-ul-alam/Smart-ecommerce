import { router } from '@inertiajs/react';
import { Mail, ShoppingCart } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function AbandonedCartsIndex({ carts, filters }) {
    const setHours = (hours) => {
        router.get('/admin/abandoned-carts', { hours }, { preserveState: true });
    };

    const sendReminder = (cartId) => {
        if (confirm('Send recovery email/SMS to this customer?')) {
            router.post(`/admin/abandoned-carts/${cartId}/remind`, {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Abandoned Carts">
            <FlashMessage />

            <p className="text-sm text-slate-500 mb-4">
                Carts with items that have been idle. Reminders also run hourly via the scheduler.
            </p>

            <div className="mb-4 max-w-xs">
                <Select
                    label="Idle for at least"
                    value={String(filters.hours)}
                    onChange={(e) => setHours(e.target.value)}
                    options={[
                        { value: '1', label: '1 hour' },
                        { value: '2', label: '2 hours' },
                        { value: '6', label: '6 hours' },
                        { value: '24', label: '24 hours' },
                        { value: '72', label: '3 days' },
                    ]}
                />
            </div>

            <Card>
                <CardHeader title={`${carts.total ?? carts.data?.length ?? 0} abandoned carts`} />
                <CardBody className="p-0 divide-y">
                    {carts.data?.map((cart) => (
                        <div key={cart.id} className="px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                            <div className="flex gap-4 items-start">
                                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <p className="font-medium">{cart.customer}</p>
                                    <p className="text-xs text-slate-500">
                                        {[cart.email, cart.phone].filter(Boolean).join(' · ') || 'No contact on file'}
                                    </p>
                                    <p className="text-sm mt-1">
                                        {cart.items_count} items · {formatPrice(cart.total)}
                                    </p>
                                    <ul className="text-xs text-slate-400 mt-1 space-y-0.5">
                                        {cart.items?.slice(0, 3).map((item) => (
                                            <li key={item.id}>{item.product_name} × {item.quantity}</li>
                                        ))}
                                        {cart.items?.length > 3 && <li>+{cart.items.length - 3} more</li>}
                                    </ul>
                                    <p className="text-xs text-slate-400 mt-2">
                                        Last active {new Date(cart.updated_at).toLocaleString()}
                                        {cart.last_reminder_at && ` · Reminded ${new Date(cart.last_reminder_at).toLocaleString()}`}
                                    </p>
                                </div>
                            </div>
                            <Button variant="secondary" onClick={() => sendReminder(cart.id)}>
                                <Mail size={16} /> Send reminder
                            </Button>
                        </div>
                    ))}
                    {!carts.data?.length && (
                        <p className="px-6 py-12 text-center text-slate-400">No abandoned carts for this threshold.</p>
                    )}
                </CardBody>
            </Card>

            <Pagination links={carts.links} className="mt-4" />
        </AdminLayout>
    );
}
