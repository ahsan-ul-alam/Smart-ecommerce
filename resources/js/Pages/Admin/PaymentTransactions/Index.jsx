import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import Pagination from '../../../Components/UI/Pagination';

const formatPrice = (n, currency = 'BDT') => `${currency === 'BDT' ? '৳' : ''}${Number(n).toLocaleString('en-BD')}`;

export default function PaymentTransactionsIndex({ transactions, filters, providers = [] }) {
    const applyFilters = (key, value) => {
        router.get('/admin/payment-transactions', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout title="Payment Transactions">
            <p className="text-sm text-slate-500 mb-4">Gateway transaction log for reconciliation and debugging.</p>

            <div className="flex flex-wrap gap-4 mb-6 max-w-2xl">
                <Select
                    label="Provider"
                    value={filters.provider || ''}
                    onChange={(e) => applyFilters('provider', e.target.value)}
                    options={[{ value: '', label: 'All' }, ...providers.map((p) => ({ value: p, label: p }))]}
                />
                <Select
                    label="Status"
                    value={filters.status || ''}
                    onChange={(e) => applyFilters('status', e.target.value)}
                    options={[
                        { value: '', label: 'All' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'failed', label: 'Failed' },
                    ]}
                />
            </div>

            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-700/80">
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Provider</th>
                                <th className="px-6 py-3">Trx ID</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {transactions.data?.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-3.5">
                                        {tx.order_id ? (
                                            <Link href={`/admin/orders/${tx.order_id}`} className="font-medium text-indigo-600 hover:underline">
                                                {tx.order_number || `#${tx.order_id}`}
                                            </Link>
                                        ) : '—'}
                                    </td>
                                    <td className="px-6 py-3.5 capitalize">{tx.provider}</td>
                                    <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">{tx.trx_id || tx.payment_id || '—'}</td>
                                    <td className="px-6 py-3.5">
                                        <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'failed' ? 'warning' : 'default'}>
                                            {tx.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3.5 text-right font-semibold">{formatPrice(tx.amount, tx.currency)}</td>
                                    <td className="px-6 py-3.5 text-slate-500 text-xs">
                                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!transactions.data?.length && (
                        <p className="text-center text-slate-400 py-12">No transactions yet.</p>
                    )}
                </div>
            </div>
            <Pagination links={transactions.links} className="mt-4" />
        </AdminLayout>
    );
}
