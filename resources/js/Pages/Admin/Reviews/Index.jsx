import { router } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody } from '../../../Components/UI/Card';

export default function ReviewsIndex({ reviews }) {
    const items = reviews.data ?? [];

    const approve = (id) => router.patch(`/admin/reviews/${id}/approve`);
    const destroy = (id) => { if (confirm('Delete review?')) router.delete(`/admin/reviews/${id}`); };

    return (
        <AdminLayout title="Product Reviews">
            <FlashMessage />
            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Rating</th>
                                <th className="px-6 py-3">Comment</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-6 py-3">{r.product?.name}</td>
                                    <td className="px-6 py-3">{r.user?.name ?? r.guest_name}</td>
                                    <td className="px-6 py-3">{'★'.repeat(r.rating)}</td>
                                    <td className="px-6 py-3 max-w-xs truncate">{r.comment}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={r.is_approved ? 'success' : 'warning'}>
                                            {r.is_approved ? 'Approved' : 'Pending'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                        {!r.is_approved && (
                                            <Button variant="ghost" onClick={() => approve(r.id)} title="Approve"><Check size={14} /></Button>
                                        )}
                                        <Button variant="ghost" onClick={() => destroy(r.id)}><Trash2 size={14} /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
