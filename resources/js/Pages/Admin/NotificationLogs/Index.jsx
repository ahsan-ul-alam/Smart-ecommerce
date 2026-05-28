import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import Input from '../../../Components/UI/Input';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const statusVariant = {
    sent: 'success',
    failed: 'danger',
    skipped: 'warning',
};

export default function NotificationLogsIndex({ logs, filters, channels, statuses }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/notification-logs', Object.fromEntries(form), { preserveState: true });
    };

    return (
        <AdminLayout title="Notification Logs">
            <FlashMessage />

            <p className="text-sm text-slate-500 mb-4">History of outbound emails and SMS from the platform.</p>

            <form onSubmit={search} className="flex flex-wrap gap-2 mb-6 items-end">
                <Select name="channel" label="Channel" defaultValue={filters.channel || ''} options={channels} className="w-36" />
                <Select name="status" label="Status" defaultValue={filters.status || ''} options={statuses} className="w-36" />
                <Input name="event" label="Event" defaultValue={filters.event || ''} placeholder="order_placed..." className="w-48" />
                <Button type="submit" variant="secondary">Filter</Button>
            </form>

            <Card>
                <CardHeader title={`${logs.total ?? 0} log entries`} />
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">When</th>
                                <th className="px-6 py-3">Channel</th>
                                <th className="px-6 py-3">Event</th>
                                <th className="px-6 py-3">Recipient</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.data?.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 capitalize">{log.channel}</td>
                                    <td className="px-6 py-3 font-mono text-xs">{log.event}</td>
                                    <td className="px-6 py-3 max-w-[200px] truncate">{log.recipient}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={statusVariant[log.status] || 'default'}>{log.status}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-400 max-w-xs truncate" title={log.message}>
                                        {log.message || '—'}
                                    </td>
                                </tr>
                            ))}
                            {!logs.data?.length && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No notification logs yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Pagination links={logs.links} className="mt-4" />
        </AdminLayout>
    );
}
