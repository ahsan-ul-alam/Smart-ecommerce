import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Textarea from '../../../Components/UI/Textarea';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = { title: '', slug: '', excerpt: '', content: '', is_published: true };

export default function Blog({ posts }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const form = useForm(empty);
    const items = posts.data ?? [];

    const openCreate = () => {
        setEditingId(null);
        form.reset();
        form.setData(empty);
        setShowForm(true);
    };

    const openEdit = (post) => {
        setEditingId(post.id);
        form.setData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content || '',
            is_published: !!post.is_published,
        });
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        form.reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            form.put(`/admin/cms/blog/${editingId}`, {
                onSuccess: () => cancelForm(),
            });
        } else {
            form.post('/admin/cms/blog', { onSuccess: () => cancelForm() });
        }
    };

    const destroy = (id) => {
        if (confirm('Delete post?')) router.delete(`/admin/cms/blog/${id}`);
    };

    return (
        <AdminLayout title="Blog">
            <FlashMessage />
            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> New Post</Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader title={editingId ? 'Edit Post' : 'New Post'} />
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            <Input label="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                            <Input label="Slug (optional)" value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} />
                            <Textarea label="Excerpt" value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} rows={2} />
                            <Textarea label="Content" value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} rows={6} />
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="rounded" />
                                Published
                            </label>
                            <div className="flex gap-2">
                                <Button type="submit" loading={form.processing}>{editingId ? 'Save' : 'Create'}</Button>
                                <Button type="button" variant="secondary" onClick={cancelForm}>Cancel</Button>
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
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-3 font-medium">{p.title}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={p.is_published ? 'success' : 'default'}>
                                            {p.is_published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-1">
                                        <Button variant="ghost" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                                        <Button variant="ghost" onClick={() => destroy(p.id)}><Trash2 size={14} /></Button>
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
