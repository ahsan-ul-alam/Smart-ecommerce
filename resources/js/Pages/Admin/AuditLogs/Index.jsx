import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const shortType = (type) => {
    if (!type) return '—';
    const parts = type.split('\\');
    return parts[parts.length - 1];
};

export default function AuditLogsIndex({ logs, filters }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/audit-logs', Object.fromEntries(form), { preserveState: true });
    };

    return (
        <AdminLayout title="Audit Logs">
            <FlashMessage />

            <p className="text-sm text-slate-500 mb-4">
                Tracks admin actions such as product changes, order updates, and site settings.
            </p>

            <form onSubmit={search} className="flex flex-wrap gap-2 mb-6 items-end">
                <Input name="event" label="Event" defaultValue={filters.event || ''} placeholder="product.updated" className="w-56" />
                <Button type="submit" variant="secondary">Filter</Button>
            </form>

            <Card>
                <CardHeader title={`${logs.total ?? 0} entries`} />
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">When</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Event</th>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">Changes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.data?.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <p className="font-medium">{log.user?.name || 'System'}</p>
                                        {log.user?.email && <p className="text-xs text-slate-400">{log.user.email}</p>}
                                    </td>
                                    <td className="px-6 py-3">
                                        <Badge variant="info">{log.event}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-xs">
                                        {shortType(log.auditable_type)}
                                        {log.auditable_id ? ` #${log.auditable_id}` : ''}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-500 max-w-md">
                                        {log.new_values && (
                                            <pre className="whitespace-pre-wrap break-all font-mono text-[10px]">
                                                {JSON.stringify(log.new_values, null, 0)}
                                            </pre>
                                        )}
                                        {!log.new_values && log.old_values && (
                                            <span className="text-slate-400">removed</span>
                                        )}
                                        {!log.new_values && !log.old_values && '—'}
                                    </td>
                                </tr>
                            ))}
                            {!logs.data?.length && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No audit entries yet. Changes to products, orders, and site settings will appear here.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Pagination links={logs.links} className="mt-4" />
        </AdminLayout>
    );
}
