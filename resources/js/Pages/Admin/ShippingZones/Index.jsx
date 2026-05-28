import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Textarea from '../../../Components/UI/Textarea';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    name: '',
    districts: '',
    shipping_charge: 80,
    free_shipping_min: '',
    sort_order: 0,
    is_active: true,
};

export default function ShippingZonesIndex({ zones }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (z) => {
        setEditing(z.id);
        form.setData({
            name: z.name,
            districts: (z.districts || []).join('\n'),
            shipping_charge: z.shipping_charge,
            free_shipping_min: z.free_shipping_min ?? '',
            sort_order: z.sort_order ?? 0,
            is_active: !!z.is_active,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/shipping-zones', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/shipping-zones/${editing}`, { onSuccess: () => setEditing(null) });
    };

    return (
        <AdminLayout title="Shipping Zones">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-4">
                Set shipping fees by district name (must match checkout districts, e.g. Dhaka, Chattogram, Comilla). Unmatched districts use Commerce default rates.
            </p>

            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add zone</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New zone' : 'Edit zone'} />
                    <CardBody>
                        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                            <Input label="Zone name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            <Input label="Sort order" type="number" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />
                            <Input label="Shipping charge (৳)" type="number" value={form.data.shipping_charge} onChange={(e) => form.setData('shipping_charge', e.target.value)} />
                            <Input label="Free shipping min (৳, optional)" type="number" value={form.data.free_shipping_min} onChange={(e) => form.setData('free_shipping_min', e.target.value)} />
                            <div className="sm:col-span-2">
                                <Textarea label="Districts (one per line)" value={form.data.districts} onChange={(e) => form.setData('districts', e.target.value)} rows={4} />
                            </div>
                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="rounded" />
                                Active
                            </label>
                            <div className="sm:col-span-2 flex gap-2">
                                <Button type="submit" loading={form.processing}>Save</Button>
                                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            <Card>
                <CardBody className="p-0 divide-y">
                    {zones.map((z) => (
                        <div key={z.id} className="px-6 py-4 flex justify-between items-start gap-4">
                            <div>
                                <p className="font-medium">{z.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{(z.districts || []).join(', ')}</p>
                                <p className="text-sm mt-2">৳{z.shipping_charge} · free over ৳{z.free_shipping_min ?? 'default'}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={z.is_active ? 'success' : 'default'}>{z.is_active ? 'Active' : 'Off'}</Badge>
                                <button type="button" onClick={() => openEdit(z)} className="p-2 text-slate-400 hover:text-teal-700"><Pencil size={16} /></button>
                                <button type="button" onClick={() => confirm('Delete zone?') && router.delete(`/admin/shipping-zones/${z.id}`)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {!zones.length && <p className="px-6 py-12 text-center text-slate-400">No zones — default commerce shipping rates apply everywhere.</p>}
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
