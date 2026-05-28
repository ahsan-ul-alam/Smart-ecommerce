import { router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import Textarea from '../../../Components/UI/Textarea';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const statusVariant = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
};

export default function ReturnRequestsIndex({ requests, filters, statuses }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/return-requests', Object.fromEntries(form), { preserveState: true });
    };

    return (
        <AdminLayout title="Return Requests">
            <FlashMessage />

            <form onSubmit={search} className="flex gap-2 mb-6 items-end">
                <Select name="status" label="Status" defaultValue={filters.status || ''} options={statuses} className="w-40" />
                <Button type="submit" variant="secondary">Filter</Button>
            </form>

            <div className="space-y-4">
                {requests.data?.map((req) => (
                    <ReturnRequestCard key={req.id} request={req} />
                ))}
                {!requests.data?.length && (
                    <Card>
                        <CardBody className="py-12 text-center text-slate-400">No return requests yet.</CardBody>
                    </Card>
                )}
            </div>

            <Pagination links={requests.links} className="mt-4" />
        </AdminLayout>
    );
}

function ReturnRequestCard({ request }) {
    const form = useForm({ status: 'approved', admin_note: request.admin_note || '' });

    const review = (status) => {
        if (!confirm(`Mark this return as ${status}?`)) return;
        form.setData('status', status);
        form.patch(`/admin/return-requests/${request.id}`, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader
                title={
                    <Link href={`/admin/orders/${request.order_id}`} className="hover:text-teal-700">
                        {request.order?.order_number}
                    </Link>
                }
                subtitle={`${request.user?.name} · ${request.user?.email}`}
                action={<Badge variant={statusVariant[request.status]}>{request.status}</Badge>}
            />
            <CardBody className="space-y-3 text-sm">
                <p><span className="text-slate-500">Reason:</span> <span className="font-medium">{request.reason}</span></p>
                {request.customer_note && <p className="text-slate-600">{request.customer_note}</p>}
                <p className="text-xs text-slate-400">Requested {new Date(request.created_at).toLocaleString()}</p>

                {request.status === 'pending' && (
                    <div className="pt-3 border-t space-y-3">
                        <Textarea
                            label="Admin note"
                            value={form.data.admin_note}
                            onChange={(e) => form.setData('admin_note', e.target.value)}
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <Button onClick={() => review('approved')} loading={form.processing}>Approve</Button>
                            <Button variant="secondary" onClick={() => review('rejected')} loading={form.processing}>Reject</Button>
                        </div>
                    </div>
                )}

                {request.admin_note && request.status !== 'pending' && (
                    <p className="text-slate-500 border-t pt-2">Admin: {request.admin_note}</p>
                )}
            </CardBody>
        </Card>
    );
}
