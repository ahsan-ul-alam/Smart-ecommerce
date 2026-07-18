import { useForm, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import BannerImageField from '../../../Components/Admin/BannerImageField';

const empty = {
    title: '',
    link: '',
    position: 'homepage_hero',
    sort_order: 0,
    is_active: true,
    image: null,
    remove_image: false,
};

export default function Banners({ banners, positions = [] }) {
    const [editing, setEditing] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const imageRef = useRef(null);
    const form = useForm(empty);

    const resetForm = () => {
        form.reset();
        form.setData(empty);
        setImagePreview(null);
        if (imageRef.current) imageRef.current.value = '';
    };

    const openCreate = () => {
        setEditing('new');
        resetForm();
    };

    const openEdit = (b) => {
        setEditing(b.id);
        form.setData({
            title: b.title,
            link: b.link || '',
            position: b.position || 'homepage_hero',
            sort_order: b.sort_order ?? 0,
            is_active: !!b.is_active,
            image: null,
            remove_image: false,
        });
        setImagePreview(b.image_url || null);
        if (imageRef.current) imageRef.current.value = '';
    };

    const onImageChange = (e) => {
        const file = e.target.files?.[0];
        form.setData('image', file ?? null);
        form.setData('remove_image', false);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        form.setData('image', null);
        form.setData('remove_image', true);
        setImagePreview(null);
        if (imageRef.current) imageRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => {
            setEditing(null);
            resetForm();
        };
        const options = { preserveScroll: true, onSuccess };

        const needsFormData = editing === 'new' || form.data.image || form.data.remove_image;

        if (editing === 'new') {
            form.post('/admin/cms/banners', { ...options, forceFormData: true });
            return;
        }

        if (needsFormData) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/cms/banners/${editing}`, { ...options, forceFormData: true });
            return;
        }

        form.put(`/admin/cms/banners/${editing}`, options);
    };

    const destroy = (id) => {
        if (confirm('Delete banner?')) router.delete(`/admin/cms/banners/${id}`);
    };

    useEffect(() => () => {
        if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

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
                            <Input
                                label="Title"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                error={form.errors.title}
                                required
                            />
                            <Input
                                label="Click-through link (optional)"
                                value={form.data.link || ''}
                                onChange={(e) => form.setData('link', e.target.value)}
                                placeholder="/shop/products"
                                error={form.errors.link}
                            />
                            <Select
                                label="Position"
                                value={form.data.position}
                                onChange={(e) => form.setData('position', e.target.value)}
                                options={positions}
                                error={form.errors.position}
                            />
                            <Input
                                label="Sort order"
                                type="number"
                                value={form.data.sort_order}
                                onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                                error={form.errors.sort_order}
                            />

                            <div className="sm:col-span-2">
                                <BannerImageField
                                    required={editing === 'new'}
                                    preview={imagePreview}
                                    inputRef={imageRef}
                                    onChange={onImageChange}
                                    onRemove={removeImage}
                                    error={form.errors.image}
                                    showRemove={editing !== 'new'}
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="rounded"
                                />
                                Active
                            </label>

                            <div className="sm:col-span-2 flex gap-2">
                                <Button type="submit" loading={form.processing}>Save</Button>
                                <Button type="button" variant="secondary" onClick={() => { setEditing(null); resetForm(); }}>Cancel</Button>
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
                                <th className="px-6 py-3">Banner</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Position</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {banners.map((b) => (
                                <tr key={b.id}>
                                    <td className="px-6 py-3">
                                        {b.image_url ? (
                                            <img src={b.image_url} alt="" className="h-12 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-600" />
                                        ) : (
                                            <span className="text-slate-400 text-xs">No image</span>
                                        )}
                                    </td>
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
