import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Textarea from '../../../Components/UI/Textarea';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    name: '', slug: '', product_id: '', headline: '', subheadline: '', hero_image: '',
    is_published: false, seo_title: '', seo_description: '',
    blocks: [{ type: 'text', title: 'Why choose this product?', body: '' }],
};

export default function SpecialProductsIndex({ pages, products }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => {
        setEditing('new');
        form.setData({ ...empty, product_id: products[0]?.id ?? '' });
    };

    const openEdit = (page) => {
        setEditing(page.id);
        form.setData({
            name: page.name,
            slug: page.slug,
            product_id: page.product_id,
            headline: page.headline || '',
            subheadline: page.subheadline || '',
            hero_image: page.hero_image || '',
            is_published: page.is_published,
            seo_title: page.seo_title || '',
            seo_description: page.seo_description || '',
            blocks: page.blocks?.length ? page.blocks : empty.blocks,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            form.post('/admin/special-products', { onSuccess: () => { setEditing(null); form.reset(); } });
        } else {
            form.put(`/admin/special-products/${editing}`, { onSuccess: () => setEditing(null) });
        }
    };

    const addBlock = (type) => {
        const blocks = [...form.data.blocks, type === 'features'
            ? { type: 'features', title: 'Features', items: ['Fast delivery', 'Official warranty'] }
            : type === 'cta'
                ? { type: 'cta', title: 'Order today', body: 'Limited stock', button: 'Buy now' }
                : { type: 'text', title: '', body: '' }];
        form.setData('blocks', blocks);
    };

    return (
        <AdminLayout title="Special Product">
            <FlashMessage />
            <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Special Product landings</h2>
                    <p className="text-sm text-slate-500 mt-1">Single-product campaign pages with a simple block builder.</p>
                </div>
                <Button onClick={openCreate}><Plus size={16} /> New landing</Button>
            </div>

            {editing && (
                <Card className="mb-6">
                    <CardHeader title={editing === 'new' ? 'Create landing' : 'Edit landing'} />
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4 max-w-2xl">
                            <Input label="Campaign name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                            <Input label="URL slug" value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} />
                            <Select label="Product" value={String(form.data.product_id)} onChange={(e) => form.setData('product_id', e.target.value)}
                                options={products.map((p) => ({ value: String(p.id), label: p.name }))} required />
                            <Input label="Headline" value={form.data.headline} onChange={(e) => form.setData('headline', e.target.value)} />
                            <Input label="Subheadline" value={form.data.subheadline} onChange={(e) => form.setData('subheadline', e.target.value)} />
                            <Input label="Hero image URL" value={form.data.hero_image} onChange={(e) => form.setData('hero_image', e.target.value)} />
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="rounded" />
                                Published
                            </label>
                            <div className="border-t pt-4 space-y-3">
                                <p className="text-sm font-semibold">Content blocks</p>
                                {form.data.blocks.map((block, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                                        <Badge>{block.type}</Badge>
                                        {block.title && <p className="font-medium mt-1">{block.title}</p>}
                                    </div>
                                ))}
                                <div className="flex gap-2 flex-wrap">
                                    <Button type="button" variant="secondary" onClick={() => addBlock('text')}>+ Text</Button>
                                    <Button type="button" variant="secondary" onClick={() => addBlock('features')}>+ Features</Button>
                                    <Button type="button" variant="secondary" onClick={() => addBlock('cta')}>+ CTA</Button>
                                </div>
                            </div>
                            <Textarea label="SEO description" value={form.data.seo_description} onChange={(e) => form.setData('seo_description', e.target.value)} rows={2} />
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
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pages.data?.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-3 font-medium">{p.name}</td>
                                    <td className="px-6 py-3">{p.product?.name}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={p.is_published ? 'success' : 'default'}>{p.is_published ? 'Live' : 'Draft'}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-1">
                                        {p.is_published && (
                                            <a href={`/offer/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 rounded-lg">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                        <Button variant="ghost" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                                        <Button variant="ghost" onClick={() => confirm('Delete?') && router.delete(`/admin/special-products/${p.id}`)}><Trash2 size={14} /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
            <Pagination links={pages.links} className="mt-4" />
        </AdminLayout>
    );
}
