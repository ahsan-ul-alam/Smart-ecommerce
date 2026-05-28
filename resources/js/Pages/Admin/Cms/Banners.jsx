import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = { title: '', image: '', link: '', position: 'homepage', sort_order: 0, is_active: true };

export default function Banners({ banners }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (b) => {
        setEditing(b.id);
        form.setData({ ...b, sort_order: b.sort_order ?? 0, is_active: !!b.is_active });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/cms/banners', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/cms/banners/${editing}`, { onSuccess: () => setEditing(null) });
    };

    const destroy = (id) => { if (confirm('Delete banner?')) router.delete(`/admin/cms/banners/${id}`); };

    return (
        <AdminLayout title="Banners">
            <FlashMessage />
            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add Banner</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New Banner' : 'Edit Banner'} />
                    <CardBody>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                            <Input label="Image URL" value={form.data.image || ''} onChange={(e) => form.setData('image', e.target.value)} />
                            <Input label="Link" value={form.data.link || ''} onChange={(e) => form.setData('link', e.target.value)} />
                            <Input label="Position" value={form.data.position} onChange={(e) => form.setData('position', e.target.value)} />
                            <Input label="Sort Order" type="number" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />
                            <label className="flex items-center gap-2 text-sm pt-6">
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
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Position</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {banners.map((b) => (
                                <tr key={b.id}>
                                    <td className="px-6 py-3 font-medium">{b.title}</td>
                                    <td className="px-6 py-3">{b.position}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={b.is_active ? 'success' : 'default'}>{b.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => openEdit(b)}><Pencil size={14} /></Button>
                                        <Button variant="ghost" onClick={() => destroy(b.id)}><Trash2 size={14} /></Button>
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
