import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ExternalLink, Wallet } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = { name: '', slug: '', email: '', phone: '', logo: '', commission_rate: 0, is_active: true };

export default function VendorsIndex({ vendors }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (v) => { setEditing(v.id); form.setData({ ...v, is_active: !!v.is_active }); };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/vendors', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/vendors/${editing}`, { onSuccess: () => setEditing(null) });
    };

    return (
        <AdminLayout title="Vendors">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-4">Assign products to vendors for multi-vendor catalog (marketplace foundation).</p>

            <div className="flex justify-end gap-2 mb-4">
                <Link href="/admin/vendors/commissions">
                    <Button variant="secondary"><Wallet size={16} /> Commissions</Button>
                </Link>
                <Button onClick={openCreate}><Plus size={16} /> Add vendor</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New vendor' : 'Edit vendor'} />
                    <CardBody>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                            <Input label="Slug" value={form.data.slug || ''} onChange={(e) => form.setData('slug', e.target.value)} />
                            <Input label="Email" value={form.data.email || ''} onChange={(e) => form.setData('email', e.target.value)} />
                            <Input label="Phone" value={form.data.phone || ''} onChange={(e) => form.setData('phone', e.target.value)} />
                            <Input label="Logo URL" value={form.data.logo || ''} onChange={(e) => form.setData('logo', e.target.value)} />
                            <Input label="Commission %" type="number" min="0" max="100" value={form.data.commission_rate} onChange={(e) => form.setData('commission_rate', e.target.value)} />
                            <label className="flex items-center gap-2 text-sm">
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
                                <th className="px-6 py-3">Vendor</th>
                                <th className="px-6 py-3">Products</th>
                                <th className="px-6 py-3">Commission</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {vendors.map((v) => (
                                <tr key={v.id}>
                                    <td className="px-6 py-3 font-medium">{v.name}</td>
                                    <td className="px-6 py-3">{v.products_count}</td>
                                    <td className="px-6 py-3">{v.commission_rate}%</td>
                                    <td className="px-6 py-3"><Badge variant={v.is_active ? 'success' : 'default'}>{v.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                        {v.is_active && (
                                            <a href={`/shop/vendors/${v.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-teal-700" title="View storefront">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                        <button type="button" onClick={() => openEdit(v)} className="p-2 text-slate-400 hover:text-teal-700"><Pencil size={16} /></button>
                                        <button type="button" onClick={() => confirm('Delete vendor?') && router.delete(`/admin/vendors/${v.id}`)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
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
