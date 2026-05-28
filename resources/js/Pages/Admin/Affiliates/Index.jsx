import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function AffiliatesIndex({ commissions, affiliates, commission_rate }) {
    const markPaid = (id) => {
        if (confirm('Mark this commission as paid?')) {
            router.patch(`/admin/affiliates/commissions/${id}`);
        }
    };

    return (
        <AdminLayout title="Affiliates">
            <FlashMessage />

            <p className="text-sm text-slate-500 mb-6">
                Commission rate: <strong>{commission_rate}%</strong> of order total. Share links like{' '}
                <code className="text-xs bg-slate-100 px-1 rounded">/?aff=AFFILIATE_CODE</code>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-1">
                    <CardHeader title="Active Affiliates" />
                    <CardBody className="divide-y divide-slate-100 dark:divide-slate-700 p-0">
                        {affiliates.length ? affiliates.map((a) => (
                            <div key={a.id} className="px-6 py-3 text-sm">
                                <p className="font-medium">{a.name}</p>
                                <p className="font-mono text-teal-700 text-xs">{a.affiliate_code}</p>
                                <Link href={`/admin/customers/${a.id}`} className="text-xs text-slate-400 hover:underline">View customer</Link>
                            </div>
                        )) : (
                            <p className="px-6 py-8 text-slate-400 text-sm">Enable affiliates from a customer profile.</p>
                        )}
                    </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader title="Commissions" />
                    <CardBody className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-slate-500">
                                    <th className="px-6 py-3">Affiliate</th>
                                    <th className="px-6 py-3">Order</th>
                                    <th className="px-6 py-3">Commission</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {commissions.data?.map((c) => (
                                    <tr key={c.id}>
                                        <td className="px-6 py-3">{c.affiliate?.name}</td>
                                        <td className="px-6 py-3 font-mono text-xs text-teal-700">{c.order?.order_number}</td>
                                        <td className="px-6 py-3 font-medium">{formatPrice(c.commission_amount)}</td>
                                        <td className="px-6 py-3">
                                            <Badge variant={c.status === 'paid' ? 'success' : 'warning'}>{c.status}</Badge>
                                        </td>
                                        <td className="px-6 py-3">
                                            {c.status === 'pending' && (
                                                <Button variant="secondary" onClick={() => markPaid(c.id)}>Mark paid</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {!commissions.data?.length && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No commissions yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>

            <Pagination links={commissions.links} meta={commissions.meta} />
        </AdminLayout>
    );
}
