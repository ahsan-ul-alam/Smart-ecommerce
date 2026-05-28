import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const shortType = (type) => {
    if (!type) return '—';
    const parts = type.split('\\');
    return parts[parts.length - 1];
};

export default function ActivityLogsIndex({ logs, filters, logNames }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/activity-logs', Object.fromEntries(form), { preserveState: true });
    };

    return (
        <AdminLayout title="Activity Logs">
            <FlashMessage />

            <p className="text-sm text-slate-500 mb-4">
                Human-readable trail of system actions such as cache clears and role updates.
            </p>

            <form onSubmit={search} className="flex flex-wrap gap-2 mb-6 items-end">
                <Input name="q" label="Search" defaultValue={filters.q || ''} placeholder="description" className="w-56" />
                <Select
                    name="log_name"
                    label="Category"
                    defaultValue={filters.log_name || ''}
                    className="w-48"
                    options={[
                        { value: '', label: 'All' },
                        ...(logNames || []).map((n) => ({ value: n, label: n })),
                    ]}
                />
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
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Details</th>
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
                                        {log.log_name ? <Badge variant="info">{log.log_name}</Badge> : '—'}
                                    </td>
                                    <td className="px-6 py-3">{log.description}</td>
                                    <td className="px-6 py-3 text-xs text-slate-500 max-w-xs">
                                        {log.subject_type && (
                                            <span className="block">
                                                {shortType(log.subject_type)}
                                                {log.subject_id ? ` #${log.subject_id}` : ''}
                                            </span>
                                        )}
                                        {log.properties && (
                                            <pre className="whitespace-pre-wrap break-all font-mono text-[10px] mt-1">
                                                {JSON.stringify(log.properties)}
                                            </pre>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!logs.data?.length && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No activity logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination links={logs.links} />
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
