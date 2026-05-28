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

const empty = { question: '', answer: '', sort_order: 0, is_active: true };

export default function Faqs({ faqs }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (f) => {
        setEditing(f.id);
        form.setData({ ...f, is_active: !!f.is_active, sort_order: f.sort_order ?? 0 });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/cms/faqs', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/cms/faqs/${editing}`, { onSuccess: () => setEditing(null) });
    };

    return (
        <AdminLayout title="FAQs">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-4">Shown on the public <a href="/shop/faq" className="text-teal-700 hover:underline" target="_blank" rel="noreferrer">FAQ page</a>.</p>

            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add FAQ</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New FAQ' : 'Edit FAQ'} />
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            <Input label="Question" value={form.data.question} onChange={(e) => form.setData('question', e.target.value)} />
                            <Textarea label="Answer" value={form.data.answer} onChange={(e) => form.setData('answer', e.target.value)} rows={4} />
                            <Input label="Sort order" type="number" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="rounded" />
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
                <CardBody className="p-0 divide-y">
                    {faqs.map((f) => (
                        <div key={f.id} className="px-6 py-4 flex justify-between gap-4">
                            <div>
                                <p className="font-medium">{f.question}</p>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{f.answer}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={f.is_active ? 'success' : 'default'}>{f.is_active ? 'Live' : 'Draft'}</Badge>
                                <button type="button" onClick={() => openEdit(f)} className="p-2 text-slate-400 hover:text-teal-700"><Pencil size={16} /></button>
                                <button type="button" onClick={() => confirm('Delete?') && router.delete(`/admin/cms/faqs/${f.id}`)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
