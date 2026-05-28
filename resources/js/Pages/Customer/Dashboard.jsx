import { Link, usePage } from '@inertiajs/react';
import AccountLayout from '../../Layouts/AccountLayout';
import Badge from '../../Components/UI/Badge';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function Dashboard({ recentOrders, stats, rewards = {} }) {
    const { modules = [] } = usePage().props;
    const showRewards = modules.includes('loyalty') || modules.includes('wallet');

    return (
        <AccountLayout title="My Account">
            <div className={`grid gap-4 mb-8 ${showRewards ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
                <Card><CardBody><p className="text-sm text-slate-500">Total Orders</p><p className="text-2xl font-bold">{stats.total_orders}</p></CardBody></Card>
                <Card><CardBody><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600">{stats.pending_orders}</p></CardBody></Card>
                {rewards.loyalty_enabled && (
                    <Card><CardBody><p className="text-sm text-slate-500">Points</p><p className="text-2xl font-bold text-teal-700">{rewards.points}</p></CardBody></Card>
                )}
                {rewards.wallet_enabled && (
                    <Card><CardBody><p className="text-sm text-slate-500">Wallet</p><p className="text-2xl font-bold text-amber-600">{formatPrice(rewards.wallet_balance)}</p></CardBody></Card>
                )}
            </div>

            <Card>
                <CardHeader title="Recent Orders" action={<Link href="/account/orders" className="text-sm text-teal-700">View all</Link>} />
                <CardBody className="p-0 divide-y divide-slate-100 dark:divide-slate-700">
                    {recentOrders.length ? recentOrders.map((order) => (
                        <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div>
                                <p className="font-mono text-sm font-medium text-teal-700">{order.order_number}</p>
                                <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <Badge>{order.status_label}</Badge>
                                <p className="font-bold mt-1">{formatPrice(order.total)}</p>
                            </div>
                        </Link>
                    )) : (
                        <p className="px-6 py-12 text-center text-slate-400">No orders yet. <Link href="/shop/products" className="text-teal-700">Start shopping</Link></p>
                    )}
                </CardBody>
            </Card>
        </AccountLayout>
    );
}
