import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Textarea from '../../../Components/UI/Textarea';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    name: '', type: 'popup', title: '', body: '', image: '', coupon_code: '',
    discount_type: 'percent', discount_value: '', cta_label: '', cta_url: '',
    show_on: ['all'], dismiss_hours: '24', starts_at: '', ends_at: '', is_active: true,
};

export default function MarketingCampaignsIndex({ campaigns, types, discountTypes, pageTargets }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (c) => {
        setEditing(c.id);
        form.setData({
            ...c,
            discount_value: c.discount_value != null ? String(c.discount_value) : '',
            dismiss_hours: String(c.dismiss_hours ?? 24),
            show_on: c.show_on ?? ['all'],
            is_active: !!c.is_active,
        });
    };

    const togglePage = (value) => {
        const current = form.data.show_on || [];
        if (value === 'all') {
            form.setData('show_on', ['all']);
            return;
        }
        const next = current.includes(value)
            ? current.filter((p) => p !== value)
            : [...current.filter((p) => p !== 'all'), value];
        form.setData('show_on', next.length ? next : ['all']);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/marketing-campaigns', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/marketing-campaigns/${editing}`, { onSuccess: () => setEditing(null) });
    };

    const destroy = (id) => { if (confirm('Delete campaign?')) router.delete(`/admin/marketing-campaigns/${id}`); };

    const isDiscount = form.data.type === 'scheduled_discount';

    return (
        <AdminLayout title="Marketing Campaigns">
            <FlashMessage />
            <div className="flex justify-between items-start mb-4 gap-4">
                <p className="text-sm text-slate-500">Popups for promotions and scheduled site-wide discounts.</p>
                <Button onClick={openCreate}><Plus size={16} /> Add Campaign</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New Campaign' : 'Edit Campaign'} />
                    <CardBody>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input label="Internal name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} required />
                            <Select label="Type" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={types.map((t) => ({ value: t.value, label: t.label }))} />
                            <Input label="Starts" type="datetime-local" value={form.data.starts_at} onChange={(e) => form.setData('starts_at', e.target.value)} />
                            <Input label="Ends" type="datetime-local" value={form.data.ends_at} onChange={(e) => form.setData('ends_at', e.target.value)} />
                            <Input label="Popup title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="sm:col-span-2" />
                            <Textarea label="Message" value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} className="sm:col-span-2 lg:col-span-3" rows={3} />
                            <Input label="Image URL" value={form.data.image} onChange={(e) => form.setData('image', e.target.value)} className="sm:col-span-2" />
                            <Input label="Coupon code (optional)" value={form.data.coupon_code} onChange={(e) => form.setData('coupon_code', e.target.value.toUpperCase())} />
                            {isDiscount && (
                                <>
                                    <Select label="Discount type" value={form.data.discount_type} onChange={(e) => form.setData('discount_type', e.target.value)} options={discountTypes.map((t) => ({ value: t.value, label: t.label }))} />
                                    <Input label="Discount value" type="number" min="0" step="0.01" value={form.data.discount_value} onChange={(e) => form.setData('discount_value', e.target.value)} required={isDiscount} />
                                </>
                            )}
                            <Input label="CTA label" value={form.data.cta_label} onChange={(e) => form.setData('cta_label', e.target.value)} />
                            <Input label="CTA URL" value={form.data.cta_url} onChange={(e) => form.setData('cta_url', e.target.value)} />
                            <Input label="Dismiss hours" type="number" min="1" value={form.data.dismiss_hours} onChange={(e) => form.setData('dismiss_hours', e.target.value)} />
                            <div className="sm:col-span-2 lg:col-span-3">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Show on pages</p>
                                <div className="flex flex-wrap gap-2">
                                    {pageTargets.map((p) => (
                                        <label key={p.value} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(form.data.show_on || []).includes(p.value)}
                                                onChange={() => togglePage(p.value)}
                                                className="rounded"
                                            />
                                            {p.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm pt-6">
                                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="rounded" />
                                Active
                            </label>
                            <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                                <Button type="submit" loading={form.processing}>Save</Button>
                                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Schedule</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {campaigns.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4 font-medium">{c.name}</td>
                                    <td className="px-6 py-4 capitalize">{c.type.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {c.starts_at || '—'} → {c.ends_at || '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={c.is_running ? 'success' : 'default'}>
                                            {c.is_running ? 'Running' : c.is_active ? 'Scheduled' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button type="button" onClick={() => openEdit(c)} className="p-2 hover:bg-slate-100 rounded-lg"><Pencil size={16} /></button>
                                        <button type="button" onClick={() => destroy(c.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
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
