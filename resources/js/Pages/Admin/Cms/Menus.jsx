import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    location: 'header',
    label: '',
    url: '/',
    sort_order: 0,
    is_active: true,
    open_in_new_tab: false,
};

export default function Menus({ items = [], locations = [] }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const reset = () => {
        form.reset();
        form.setData(empty);
        form.clearErrors();
    };

    const openCreate = (location = 'header') => {
        setEditing('new');
        reset();
        form.setData('location', location);
    };

    const openEdit = (item) => {
        setEditing(item.id);
        form.setData({
            location: item.location,
            label: item.label,
            url: item.url,
            sort_order: item.sort_order ?? 0,
            is_active: !!item.is_active,
            open_in_new_tab: !!item.open_in_new_tab,
        });
        form.clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => { setEditing(null); reset(); },
        };
        if (editing === 'new') {
            form.post('/admin/cms/menus', options);
        } else {
            form.put(`/admin/cms/menus/${editing}`, options);
        }
    };

    const destroy = (id) => {
        if (confirm('Remove this menu item?')) {
            router.delete(`/admin/cms/menus/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Menus">
            <FlashMessage />

            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                    Manage the links shown in the storefront header and footer. Use relative paths like
                    {' '}<code className="px-1 rounded bg-slate-100 dark:bg-slate-800">/shop/track</code>{' '}
                    or full URLs.
                </p>
                <Button onClick={() => openCreate()}><Plus size={16} /> Add Item</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New Menu Item' : 'Edit Menu Item'} />
                    <CardBody>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                                <select
                                    value={form.data.location}
                                    onChange={(e) => form.setData('location', e.target.value)}
                                    className="input-premium"
                                >
                                    {locations.map((l) => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                                {form.errors.location && <p className="text-xs text-red-500">{form.errors.location}</p>}
                            </div>
                            <Input
                                label="Label"
                                value={form.data.label}
                                onChange={(e) => form.setData('label', e.target.value)}
                                error={form.errors.label}
                                required
                            />
                            <Input
                                label="URL"
                                value={form.data.url}
                                onChange={(e) => form.setData('url', e.target.value)}
                                placeholder="/shop/products"
                                error={form.errors.url}
                                required
                            />
                            <Input
                                label="Sort order"
                                type="number"
                                value={form.data.sort_order}
                                onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                                error={form.errors.sort_order}
                            />

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="rounded"
                                />
                                Active
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.open_in_new_tab}
                                    onChange={(e) => form.setData('open_in_new_tab', e.target.checked)}
                                    className="rounded"
                                />
                                Open in new tab
                            </label>

                            <div className="sm:col-span-2 flex gap-2">
                                <Button type="submit" loading={form.processing}>Save</Button>
                                <Button type="button" variant="secondary" onClick={() => { setEditing(null); reset(); }}>Cancel</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            <div className="space-y-6">
                {locations.map((loc) => {
                    const rows = items
                        .filter((i) => i.location === loc.value)
                        .sort((a, b) => a.sort_order - b.sort_order);

                    return (
                        <Card key={loc.value}>
                            <CardHeader
                                title={loc.label}
                                action={<Button size="sm" variant="secondary" onClick={() => openCreate(loc.value)}><Plus size={14} /> Add</Button>}
                            />
                            <CardBody className="p-0 overflow-x-auto">
                                {rows.length === 0 ? (
                                    <p className="px-6 py-6 text-sm text-slate-400">No items yet.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-slate-500">
                                                <th className="px-6 py-3 w-16">Order</th>
                                                <th className="px-6 py-3">Label</th>
                                                <th className="px-6 py-3">URL</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {rows.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-3 text-slate-400">{item.sort_order}</td>
                                                    <td className="px-6 py-3 font-medium">
                                                        {item.label}
                                                        {item.open_in_new_tab && <ExternalLink size={12} className="inline ml-1 -mt-0.5 text-slate-400" />}
                                                    </td>
                                                    <td className="px-6 py-3 font-mono text-xs text-slate-500">{item.url}</td>
                                                    <td className="px-6 py-3">
                                                        <Badge variant={item.is_active ? 'success' : 'default'}>{item.is_active ? 'Active' : 'Hidden'}</Badge>
                                                    </td>
                                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                                        <Button variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                                                        <Button variant="ghost" onClick={() => destroy(item.id)}><Trash2 size={14} /></Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </CardBody>
                        </Card>
                    );
                })}
            </div>
        </AdminLayout>
    );
}
