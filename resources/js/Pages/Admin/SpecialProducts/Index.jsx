import { useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Layout } from 'lucide-react';
import clsx from 'clsx';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody } from '../../../Components/UI/Card';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
];

const STATUS_STYLES = {
    draft: 'border-slate-200 bg-slate-50 text-slate-700',
    published: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    scheduled: 'border-amber-200 bg-amber-50 text-amber-800',
};

function pageStatus(page) {
    return page.status ?? (page.is_published ? 'published' : 'draft');
}

function StatusCell({ page }) {
    const status = pageStatus(page);
    const [processing, setProcessing] = useState(false);

    const patch = (payload) => {
        setProcessing(true);
        router.patch(`/admin/special-products/${page.id}/status`, payload, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const scheduledValue = page.scheduled_at
        ? new Date(page.scheduled_at).toISOString().slice(0, 16)
        : '';

    return (
        <div className="min-w-[140px]">
            <select
                value={status}
                disabled={processing}
                onChange={(e) => patch({ status: e.target.value, scheduled_at: page.scheduled_at })}
                className={clsx(
                    'w-full text-xs font-semibold rounded-lg border px-2 py-1.5 cursor-pointer',
                    'disabled:opacity-50 disabled:cursor-wait',
                    STATUS_STYLES[status] || STATUS_STYLES.draft,
                )}
            >
                {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {status === 'scheduled' && (
                <input
                    type="datetime-local"
                    disabled={processing}
                    value={scheduledValue}
                    onChange={(e) => patch({
                        status: 'scheduled',
                        scheduled_at: e.target.value || null,
                    })}
                    className="mt-1.5 w-full text-[11px] rounded-lg border border-amber-200 px-2 py-1 bg-white"
                />
            )}
        </div>
    );
}

export default function SpecialProductsIndex({ pages, products }) {
    const [creating, setCreating] = useState(false);
    const form = useForm({ name: '', product_id: products[0]?.id ? String(products[0].id) : '' });

    const submitCreate = (e) => {
        e.preventDefault();
        form.post('/admin/special-products', {
            onSuccess: () => {
                setCreating(false);
                form.reset();
            },
        });
    };

    return (
        <AdminLayout title="Special Product">
            <FlashMessage />
            <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Special product landings</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Build high-converting single-product pages with guest checkout and payment on one page.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}><Plus size={16} /> New landing</Button>
            </div>

            {creating && (
                <Card className="mb-6">
                    <form onSubmit={submitCreate} className="p-6 flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Input label="Campaign name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                        </div>
                        <div className="min-w-[200px]">
                            <Select
                                label="Product"
                                value={form.data.product_id}
                                onChange={(e) => form.setData('product_id', e.target.value)}
                                options={products.map((p) => ({ value: String(p.id), label: p.name }))}
                                required
                            />
                        </div>
                        <Button type="submit" loading={form.processing}>Create & open builder</Button>
                        <Button type="button" variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
                    </form>
                </Card>
            )}

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Campaign</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Orders</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pages.data?.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-3 font-medium">{p.name}</td>
                                    <td className="px-6 py-3">{p.product?.name}</td>
                                    <td className="px-6 py-3 tabular-nums">{p.orders_count ?? 0}</td>
                                    <td className="px-6 py-3">
                                        <StatusCell page={p} />
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {(p.is_published || pageStatus(p) === 'published') && (
                                                <a href={`/offer/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 rounded-lg" title="View live">
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <Link href={`/admin/special-products/${p.id}/edit`} className="p-2 hover:bg-slate-100 rounded-lg inline-flex" title="Open builder">
                                                <Layout size={14} />
                                            </Link>
                                            <Button variant="ghost" onClick={() => confirm('Delete?') && router.delete(`/admin/special-products/${p.id}`)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
            <Pagination links={pages.links} className="mt-4" />
        </AdminLayout>
    );
}
