import { useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function BrandsIndex({ brands }) {
    const [editing, setEditing] = useState(null);
    const form = useForm({ name: '', slug: '', is_active: true });

    const openCreate = () => {
        setEditing('new');
        form.reset();
        form.setData({ name: '', slug: '', is_active: true });
    };

    const openEdit = (brand) => {
        setEditing(brand.id);
        form.setData({ name: brand.name, slug: brand.slug, is_active: brand.is_active });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            form.post('/admin/brands', { onSuccess: () => setEditing(null) });
        } else {
            form.put(`/admin/brands/${editing}`, { onSuccess: () => setEditing(null) });
        }
    };

    const destroy = (id) => {
        if (confirm('Delete this brand?')) router.delete(`/admin/brands/${id}`);
    };

    return (
        <AdminLayout title="Brands">
            <FlashMessage />

            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add Brand</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {editing && (
                    <Card>
                        <CardHeader title={editing === 'new' ? 'New Brand' : 'Edit Brand'} />
                        <CardBody>
                            <form onSubmit={submit} className="space-y-4">
                                <Input label="Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} required />
                                <Input label="Slug" value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} />
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="rounded" />
                                    Active
                                </label>
                                <div className="flex gap-2">
                                    <Button type="submit" loading={form.processing} className="flex-1">Save</Button>
                                    <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                <Card className={editing ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <CardBody className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500">
                                    <th className="px-6 py-3">Brand</th>
                                    <th className="px-6 py-3">Slug</th>
                                    <th className="px-6 py-3">Products</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {brands.map((brand) => (
                                    <tr key={brand.id}>
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{brand.name}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{brand.slug}</td>
                                        <td className="px-6 py-4">{brand.products_count}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={brand.is_active ? 'success' : 'default'}>
                                                {brand.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button type="button" onClick={() => openEdit(brand)} className="p-2 hover:bg-slate-100 rounded-lg"><Pencil size={16} /></button>
                                            <button type="button" onClick={() => destroy(brand.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
}
