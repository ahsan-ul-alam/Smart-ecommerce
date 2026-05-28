import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Zap } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Textarea from '../../../Components/UI/Textarea';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    title: '', slug: '', description: '',
    starts_at: '', ends_at: '', is_active: true, products: [],
};

export default function FlashSalesIndex({ flashSales, catalogProducts }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => {
        setEditing('new');
        const start = new Date();
        const end = new Date(Date.now() + 7 * 86400000);
        form.reset();
        form.setData({
            ...empty,
            starts_at: start.toISOString().slice(0, 16),
            ends_at: end.toISOString().slice(0, 16),
        });
    };

    const openEdit = (sale) => {
        setEditing(sale.id);
        form.setData({
            title: sale.title,
            slug: sale.slug,
            description: sale.description || '',
            starts_at: sale.starts_at,
            ends_at: sale.ends_at,
            is_active: sale.is_active,
            products: sale.products.map((p) => ({
                product_id: p.product_id,
                sale_price: String(p.sale_price),
                max_quantity: p.max_quantity ? String(p.max_quantity) : '',
            })),
        });
    };

    const addProduct = () => {
        const first = catalogProducts.find((p) => !form.data.products.some((r) => r.product_id === p.id));
        if (!first) return;
        form.setData('products', [
            ...form.data.products,
            { product_id: first.id, sale_price: String(Math.round(first.price * 0.85)), max_quantity: '' },
        ]);
    };

    const updateProductRow = (index, field, value) => {
        const rows = [...form.data.products];
        rows[index] = { ...rows[index], [field]: value };
        form.setData('products', rows);
    };

    const removeProductRow = (index) => {
        form.setData('products', form.data.products.filter((_, i) => i !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/flash-sales', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/flash-sales/${editing}`, { onSuccess: () => setEditing(null) });
    };

    const destroy = (id) => { if (confirm('Delete flash sale?')) router.delete(`/admin/flash-sales/${id}`); };

    return (
        <AdminLayout title="Flash Sales">
            <FlashMessage />
            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> New Flash Sale</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New Flash Sale' : 'Edit Flash Sale'} />
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                                <Input label="Slug" value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} placeholder="auto-generated" />
                                <Input label="Starts" type="datetime-local" value={form.data.starts_at} onChange={(e) => form.setData('starts_at', e.target.value)} required />
                                <Input label="Ends" type="datetime-local" value={form.data.ends_at} onChange={(e) => form.setData('ends_at', e.target.value)} required />
                            </div>
                            <Textarea label="Description" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={2} />
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="rounded" />
                                Active
                            </label>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-slate-800 dark:text-white">Sale Products</h4>
                                    <Button type="button" variant="secondary" onClick={addProduct}>Add Product</Button>
                                </div>
                                <div className="space-y-2">
                                    {form.data.products.map((row, i) => {
                                        const catalog = catalogProducts.find((p) => p.id === row.product_id);
                                        return (
                                            <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end border p-3 rounded-lg">
                                                <select
                                                    value={row.product_id}
                                                    onChange={(e) => updateProductRow(i, 'product_id', Number(e.target.value))}
                                                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm sm:col-span-2"
                                                >
                                                    {catalogProducts.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                                                    ))}
                                                </select>
                                                <Input label={`Sale ৳${catalog?.price ?? ''}`} type="number" min="0" value={row.sale_price} onChange={(e) => updateProductRow(i, 'sale_price', e.target.value)} />
                                                <div className="flex gap-2">
                                                    <Input label="Max qty" type="number" min="1" value={row.max_quantity} onChange={(e) => updateProductRow(i, 'max_quantity', e.target.value)} />
                                                    <Button type="button" variant="ghost" onClick={() => removeProductRow(i)}><Trash2 size={14} /></Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-2">
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
                                <th className="px-6 py-3">Sale</th>
                                <th className="px-6 py-3">Period</th>
                                <th className="px-6 py-3">Products</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {flashSales.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Zap size={14} className="text-amber-500" />
                                            {sale.title}
                                        </div>
                                        <p className="text-xs text-slate-400">/{sale.slug}</p>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-500">
                                        {new Date(sale.starts_at).toLocaleString()} — {new Date(sale.ends_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3">{sale.products_count}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={sale.is_running ? 'success' : sale.is_active ? 'warning' : 'default'}>
                                            {sale.is_running ? 'Live' : sale.is_active ? 'Scheduled' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => openEdit(sale)}><Pencil size={14} /></Button>
                                        <Button variant="ghost" onClick={() => destroy(sale.id)}><Trash2 size={14} /></Button>
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
