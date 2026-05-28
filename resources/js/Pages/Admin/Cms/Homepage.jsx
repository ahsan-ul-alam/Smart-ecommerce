import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Textarea from '../../../Components/UI/Textarea';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    type: 'hero', title: '', subtitle: '', content: '', image: '', link: '', button_text: 'Browse Products',
    sort_order: 0, is_active: true, settings: { limit: 4 },
};

export default function Homepage({ sections, sectionTypes }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => { setEditing('new'); form.reset(); form.setData(empty); };
    const openEdit = (s) => {
        setEditing(s.id);
        form.setData({ ...s, is_active: !!s.is_active, sort_order: s.sort_order ?? 0, settings: s.settings || { limit: 4 } });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') form.post('/admin/cms/homepage', { onSuccess: () => setEditing(null) });
        else form.put(`/admin/cms/homepage/${editing}`, { onSuccess: () => setEditing(null) });
    };

    return (
        <AdminLayout title="Homepage Builder">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-4">Control hero, trust badges, featured products, and promo blocks on the storefront homepage.</p>

            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add section</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'New section' : 'Edit section'} />
                    <CardBody>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select label="Type" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}
                                options={sectionTypes.map((t) => ({ value: t.value, label: t.label }))} />
                            <Input label="Sort order" type="number" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />
                            <Input label="Title" value={form.data.title || ''} onChange={(e) => form.setData('title', e.target.value)} />
                            <Input label="Subtitle" value={form.data.subtitle || ''} onChange={(e) => form.setData('subtitle', e.target.value)} />
                            <Input label="Image URL" value={form.data.image || ''} onChange={(e) => form.setData('image', e.target.value)} />
                            <Input label="Link" value={form.data.link || ''} onChange={(e) => form.setData('link', e.target.value)} />
                            <Input label="Button text" value={form.data.button_text || ''} onChange={(e) => form.setData('button_text', e.target.value)} />
                            {form.data.type === 'featured_products' && (
                                <Input
                                    label="Featured product count (1–12)"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={form.data.settings?.limit ?? 4}
                                    onChange={(e) => form.setData('settings', { ...form.data.settings, limit: Number(e.target.value) })}
                                />
                            )}
                            <div className="sm:col-span-2">
                                <Textarea label="Content (HTML or JSON for trust badges)" value={form.data.content || ''} onChange={(e) => form.setData('content', e.target.value)} rows={4} />
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
                    {sections.map((s, index) => (
                        <div key={s.id} className="flex items-center justify-between px-6 py-4">
                            <div>
                                <p className="font-medium">{s.title || s.type}</p>
                                <p className="text-xs text-slate-400">{s.type} · order {s.sort_order}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)} className="p-1 text-slate-400 hover:text-teal-700 disabled:opacity-30"><ChevronUp size={16} /></button>
                                    <button type="button" disabled={index === sections.length - 1} onClick={() => moveSection(index, 1)} className="p-1 text-slate-400 hover:text-teal-700 disabled:opacity-30"><ChevronDown size={16} /></button>
                                </div>
                                <Badge variant={s.is_active ? 'success' : 'default'}>{s.is_active ? 'Active' : 'Off'}</Badge>
                                <button type="button" onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-teal-700"><Pencil size={16} /></button>
                                <button type="button" onClick={() => confirm('Delete?') && router.delete(`/admin/cms/homepage/${s.id}`)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
