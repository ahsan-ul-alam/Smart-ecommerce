import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Textarea from '../../../Components/UI/Textarea';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = { title: '', slug: '', content: '', is_published: true, seo_title: '', seo_description: '' };

export default function Pages({ pages }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (p) => {
        setEditing(p.id);
        form.setData({ ...p, is_published: !!p.is_published });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/cms/pages', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/cms/pages/${editing}`, { onSuccess: () => setEditing(null) });
    };

    const destroy = (id) => { if (confirm('Delete page?')) router.delete(`/admin/cms/pages/${id}`); };

    return (
        <AdminLayout title="CMS Pages">
            <FlashMessage />
            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add Page</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New Page' : 'Edit Page'} />
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                                <Input label="Slug" value={form.data.slug || ''} onChange={(e) => form.setData('slug', e.target.value)} placeholder="auto-from-title" />
                            </div>
                            <Textarea label="Content" value={form.data.content || ''} onChange={(e) => form.setData('content', e.target.value)} rows={8} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="SEO Title" value={form.data.seo_title || ''} onChange={(e) => form.setData('seo_title', e.target.value)} />
                                <Input label="SEO Description" value={form.data.seo_description || ''} onChange={(e) => form.setData('seo_description', e.target.value)} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="rounded" />
                                Published
                            </label>
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
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Slug</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pages.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-3 font-medium">{p.title}</td>
                                    <td className="px-6 py-3 font-mono text-xs text-slate-400">/pages/{p.slug}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={p.is_published ? 'success' : 'default'}>{p.is_published ? 'Published' : 'Draft'}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                        {p.is_published && (
                                            <a href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-teal-700">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                        <button type="button" onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-teal-700"><Pencil size={16} /></button>
                                        <button type="button" onClick={() => destroy(p.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
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
