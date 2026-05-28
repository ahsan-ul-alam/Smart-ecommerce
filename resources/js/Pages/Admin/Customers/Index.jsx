import { Link, router } from '@inertiajs/react';
import { Search, Eye, Download } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody } from '../../../Components/UI/Card';

const statusVariant = {
    active: 'success',
    inactive: 'default',
    banned: 'danger',
};

export default function CustomersIndex({ customers, filters, statuses }) {
    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/customers', Object.fromEntries(form), { preserveState: true });
    };

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        const qs = params.toString();
        return `/admin/customers/export${qs ? `?${qs}` : ''}`;
    };

    return (
        <AdminLayout title="Customers">
            <FlashMessage />

            <form onSubmit={search} className="flex flex-wrap gap-2 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        name="search"
                        defaultValue={filters.search || ''}
                        placeholder="Name, email, phone..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                    />
                </div>
                <Select
                    name="status"
                    defaultValue={filters.status || ''}
                    placeholder="All statuses"
                    options={statuses.map((s) => ({ value: s.value, label: s.label }))}
                    className="w-36"
                />
                <Button type="submit" variant="secondary">Filter</Button>
                <a href={exportUrl()} className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Download size={16} /> Export CSV
                </a>
            </form>

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Orders</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {customers.data?.length ? customers.data.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-3">
                                        <p className="font-medium text-slate-800 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-slate-400">{c.email}</p>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500">{c.phone || '—'}</td>
                                    <td className="px-6 py-3">{c.orders_count}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={statusVariant[c.status] || 'default'}>{c.status_label}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 text-xs">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <Link href={`/admin/customers/${c.id}`} className="p-2 inline-flex rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <Eye size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">No customers found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Pagination links={customers.links} meta={customers.meta} />
        </AdminLayout>
    );
}
