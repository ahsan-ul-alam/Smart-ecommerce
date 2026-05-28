import { Link } from '@inertiajs/react';
import AccountLayout from '../../../Layouts/AccountLayout';
import Badge from '../../../Components/UI/Badge';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody } from '../../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function OrdersIndex({ orders }) {
    return (
        <AccountLayout title="My Orders">
            <Card>
                <CardBody className="p-0 divide-y divide-slate-100 dark:divide-slate-700">
                    {orders.data?.map((order) => (
                        <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div>
                                <p className="font-mono font-medium text-teal-700">{order.order_number}</p>
                                <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                                <p className="text-xs text-slate-400">{order.payment_method_label}</p>
                            </div>
                            <div className="text-right">
                                <Badge>{order.status_label}</Badge>
                                <p className="font-bold mt-1">{formatPrice(order.total)}</p>
                            </div>
                        </Link>
                    ))}
                    {!orders.data?.length && <p className="px-6 py-12 text-center text-slate-400">No orders found.</p>}
                </CardBody>
            </Card>
            <Pagination links={orders.links} meta={orders.meta} />
        </AccountLayout>
    );
}
