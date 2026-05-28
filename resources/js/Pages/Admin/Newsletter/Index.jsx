import { router } from '@inertiajs/react';
import { Download, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import StatCard from '../../../Components/UI/StatCard';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function NewsletterIndex({ subscribers, filters, stats }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/newsletter', Object.fromEntries(form), { preserveState: true });
    };

    const remove = (id) => {
        if (confirm('Remove this subscriber permanently?')) {
            router.delete(`/admin/newsletter/${id}`);
        }
    };

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', filters.status);
        const qs = params.toString();
        return `/admin/newsletter/export${qs ? `?${qs}` : ''}`;
    };

    return (
        <AdminLayout title="Newsletter">
            <FlashMessage />

            <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-xl">
                <StatCard label="Active subscribers" value={stats.active} />
                <StatCard label="Total signups" value={stats.total} />
            </div>

            <form onSubmit={search} className="flex flex-wrap gap-2 mb-6 items-end">
                <Input name="q" label="Email" defaultValue={filters.q || ''} placeholder="search@email.com" className="w-56" />
                <Select
                    name="status"
                    label="Status"
                    defaultValue={filters.status || ''}
                    className="w-40"
                    options={[
                        { value: '', label: 'All' },
                        { value: 'active', label: 'Active' },
                        { value: 'unsubscribed', label: 'Unsubscribed' },
                    ]}
                />
                <Button type="submit" variant="secondary">Filter</Button>
                <a href={exportUrl()} className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ml-auto">
                    <Download size={16} /> Export CSV
                </a>
            </form>

            <Card>
                <CardHeader title={`${subscribers.total ?? 0} subscribers`} />
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Subscribed</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {subscribers.data?.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-6 py-3 font-medium">{row.email}</td>
                                    <td className="px-6 py-3 text-slate-500">{row.source}</td>
                                    <td className="px-6 py-3 text-xs text-slate-500">
                                        {new Date(row.subscribed_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        {row.unsubscribed_at ? (
                                            <Badge variant="warning">Unsubscribed</Badge>
                                        ) : (
                                            <Badge variant="success">Active</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => remove(row.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!subscribers.data?.length && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No subscribers yet. They appear when customers sign up from the storefront footer.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination links={subscribers.links} />
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
