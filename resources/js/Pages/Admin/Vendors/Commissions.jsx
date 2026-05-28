import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import StatCard from '../../../Components/UI/StatCard';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function VendorCommissions({ commissions, totals }) {
    const markPaid = (id) => {
        if (confirm('Mark this vendor commission as paid?')) {
            router.patch(`/admin/vendors/commissions/${id}`);
        }
    };

    return (
        <AdminLayout title="Vendor Commissions">
            <FlashMessage />

            <div className="flex flex-wrap gap-2 mb-6">
                <Link href="/admin/vendors" className="text-sm text-teal-700 hover:underline">← Vendors</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <StatCard label="Pending payouts" value={formatPrice(totals.pending)} />
                <StatCard label="Paid out" value={formatPrice(totals.paid)} />
            </div>

            <Card>
                <CardHeader title="Commission ledger" />
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Vendor</th>
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Line total</th>
                                <th className="px-6 py-3">Rate</th>
                                <th className="px-6 py-3">Commission</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {commissions.data?.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-6 py-3 font-medium">{c.vendor?.name}</td>
                                    <td className="px-6 py-3 font-mono text-xs text-teal-700">{c.order?.order_number}</td>
                                    <td className="px-6 py-3">{formatPrice(c.line_total)}</td>
                                    <td className="px-6 py-3">{c.commission_rate}%</td>
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
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No vendor commissions yet. Assign products to vendors and complete paid orders.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Pagination links={commissions.links} className="mt-4" />
        </AdminLayout>
    );
}
