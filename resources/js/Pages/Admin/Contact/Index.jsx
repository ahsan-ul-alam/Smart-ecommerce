import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2, Mail } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import StatCard from '../../../Components/UI/StatCard';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const statusVariant = { new: 'warning', read: 'info', archived: 'default' };

export default function ContactIndex({ inquiries, filters, stats }) {
    const [expanded, setExpanded] = useState(null);

    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/contact-inquiries', Object.fromEntries(form), { preserveState: true });
    };

    const updateStatus = (id, status) => {
        router.patch(`/admin/contact-inquiries/${id}`, { status }, { preserveScroll: true });
    };

    const remove = (id) => {
        if (confirm('Delete this inquiry?')) {
            router.delete(`/admin/contact-inquiries/${id}`);
        }
    };

    return (
        <AdminLayout title="Contact Inquiries">
            <FlashMessage />

            <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-xl">
                <StatCard label="New messages" value={stats.new} />
                <StatCard label="Total inquiries" value={stats.total} />
            </div>

            <form onSubmit={search} className="flex flex-wrap gap-2 mb-6 items-end">
                <Input name="q" label="Search" defaultValue={filters.q || ''} placeholder="name, email, subject" className="w-56" />
                <Select
                    name="status"
                    label="Status"
                    defaultValue={filters.status || ''}
                    className="w-40"
                    options={[
                        { value: '', label: 'All' },
                        { value: 'new', label: 'New' },
                        { value: 'read', label: 'Read' },
                        { value: 'archived', label: 'Archived' },
                    ]}
                />
                <Button type="submit" variant="secondary">Filter</Button>
            </form>

            <div className="space-y-3">
                {inquiries.data?.map((row) => (
                    <Card key={row.id}>
                        <CardBody>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-700">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{row.subject}</p>
                                        <p className="text-sm text-slate-500">
                                            {row.name} · <a href={`mailto:${row.email}`} className="text-teal-700">{row.email}</a>
                                            {row.phone ? ` · ${row.phone}` : ''}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(row.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>
                                    <select
                                        className="text-xs rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-800"
                                        value={row.status}
                                        onChange={(e) => updateStatus(row.id, e.target.value)}
                                    >
                                        <option value="new">New</option>
                                        <option value="read">Read</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <button type="button" onClick={() => remove(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                                className="text-sm text-teal-700 mt-3 hover:underline"
                            >
                                {expanded === row.id ? 'Hide message' : 'View message'}
                            </button>
                            {expanded === row.id && (
                                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border-t pt-3">
                                    {row.message}
                                </p>
                            )}
                        </CardBody>
                    </Card>
                ))}
                {!inquiries.data?.length && (
                    <Card>
                        <CardBody className="text-center text-slate-500 py-12">No contact messages yet.</CardBody>
                    </Card>
                )}
            </div>

            <div className="mt-6">
                <Pagination links={inquiries.links} />
            </div>
        </AdminLayout>
    );
}
