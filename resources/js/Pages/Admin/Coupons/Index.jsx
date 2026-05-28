import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    code: '', type: 'percent', value: '', min_order_amount: '',
    max_uses: '', starts_at: '', expires_at: '', is_active: true,
};

export default function CouponsIndex({ coupons, types }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (c) => {
        setEditing(c.id);
        form.setData({
            ...c,
            value: String(c.value),
            min_order_amount: c.min_order_amount ? String(c.min_order_amount) : '',
            max_uses: c.max_uses ? String(c.max_uses) : '',
            starts_at: c.starts_at ? c.starts_at.slice(0, 10) : '',
            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
            is_active: !!c.is_active,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/coupons', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/coupons/${editing}`, { onSuccess: () => setEditing(null) });
    };

    const destroy = (id) => { if (confirm('Delete coupon?')) router.delete(`/admin/coupons/${id}`); };

    return (
        <AdminLayout title="Coupons">
            <FlashMessage />
            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add Coupon</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New Coupon' : 'Edit Coupon'} />
                    <CardBody>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input label="Code" value={form.data.code} onChange={(e) => form.setData('code', e.target.value.toUpperCase())} error={form.errors.code} required />
                            <Select label="Type" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={types} />
                            <Input label="Value" type="number" min="0" step="0.01" value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} error={form.errors.value} required />
                            <Input label="Min Order (৳)" type="number" min="0" value={form.data.min_order_amount} onChange={(e) => form.setData('min_order_amount', e.target.value)} />
                            <Input label="Max Uses" type="number" min="1" value={form.data.max_uses} onChange={(e) => form.setData('max_uses', e.target.value)} />
                            <Input label="Starts" type="date" value={form.data.starts_at} onChange={(e) => form.setData('starts_at', e.target.value)} />
                            <Input label="Expires" type="date" value={form.data.expires_at} onChange={(e) => form.setData('expires_at', e.target.value)} />
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
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Discount</th>
                                <th className="px-6 py-3">Usage</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {coupons.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4 font-mono font-bold text-teal-700">{c.code}</td>
                                    <td className="px-6 py-4">
                                        {c.type === 'percent' ? `${c.value}%` : `৳${c.value}`}
                                        {c.min_order_amount && <span className="text-xs text-slate-400 block">Min ৳{c.min_order_amount}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                                    <td className="px-6 py-4"><Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
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
