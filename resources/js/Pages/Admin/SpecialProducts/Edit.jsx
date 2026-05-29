import { useForm, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Textarea from '../../../Components/UI/Textarea';
import Select from '../../../Components/UI/Select';
import FlashMessage from '../../../Components/UI/FlashMessage';
import LandingPageBuilder from '../../../Builder/editor/LandingPageBuilder';
import { useBuilderStore } from '../../../Builder/store/builderStore';
import { stripEditorMeta, collectMediaFiles } from '../../../Builder/schema/defaults';

export default function SpecialProductsEdit({ page, products, catalog, versions = [], checkoutPreview = {} }) {
    const form = useForm({
        name: page.name,
        slug: page.slug,
        product_id: String(page.product_id),
        status: page.status || 'draft',
        scheduled_at: page.scheduled_at?.slice(0, 16) || '',
        seo_title: page.seo_title || '',
        seo_description: page.seo_description || '',
        canonical_url: page.canonical_url || '',
    });

    const product = products.find((p) => String(p.id) === form.data.product_id) || page.product;

    const save = () => {
        const schema = useBuilderStore.getState().getSchema();
        schema.roots = stripEditorMeta(schema.roots);
        schema.theme = useBuilderStore.getState().theme;
        const media = collectMediaFiles(useBuilderStore.getState().roots);
        const hasMedia = Object.keys(media).length > 0;
        const url = `/admin/special-products/${page.id}`;

        if (hasMedia) {
            const fd = new FormData();
            fd.append('_method', 'put');
            fd.append('name', form.data.name);
            fd.append('slug', form.data.slug);
            fd.append('product_id', form.data.product_id);
            fd.append('status', form.data.status);
            fd.append('scheduled_at', form.data.scheduled_at || '');
            fd.append('seo_title', form.data.seo_title);
            fd.append('seo_description', form.data.seo_description);
            fd.append('canonical_url', form.data.canonical_url || '');
            fd.append('schema', JSON.stringify(schema));
            fd.append('theme', JSON.stringify(schema.theme));
            Object.entries(media).forEach(([id, file]) => {
                if (Array.isArray(file)) file.forEach((f) => fd.append(`block_media[${id}][]`, f));
                else fd.append(`block_media[${id}]`, file);
            });
            router.post(url, fd, { preserveScroll: true, onSuccess: () => useBuilderStore.getState().markSaved() });
        } else {
            router.put(url, { ...form.data, schema, theme: schema.theme }, {
                preserveScroll: true,
                onSuccess: () => useBuilderStore.getState().markSaved(),
            });
        }
    };

    const restoreVersion = async (versionId) => {
        const res = await fetch(`/admin/special-products/${page.id}/versions/${versionId}/restore`, {
            method: 'POST',
            headers: { 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''), Accept: 'application/json' },
        });
        const data = await res.json();
        if (data.schema) useBuilderStore.getState().importSchema(data.schema);
    };

    const pageSettings = (
        <div className="p-4 space-y-3 text-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Page & SEO</p>
            <Input label="Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
            <Input label="Slug" value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} />
            <Select label="Product" value={form.data.product_id} onChange={(e) => form.setData('product_id', e.target.value)}
                options={products.map((p) => ({ value: String(p.id), label: p.name }))} />
            <Select label="Status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}
                options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'scheduled', label: 'Scheduled' }]} />
            {form.data.status === 'scheduled' && (
                <Input label="Publish at" type="datetime-local" value={form.data.scheduled_at} onChange={(e) => form.setData('scheduled_at', e.target.value)} />
            )}
            <Input label="SEO title" value={form.data.seo_title} onChange={(e) => form.setData('seo_title', e.target.value)} />
            <Textarea label="SEO description" value={form.data.seo_description} onChange={(e) => form.setData('seo_description', e.target.value)} rows={2} />
            <Input label="Canonical URL" value={form.data.canonical_url} onChange={(e) => form.setData('canonical_url', e.target.value)} />
            {versions.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Version history</p>
                    <select className="w-full text-xs border rounded-lg p-2" defaultValue="" onChange={(e) => e.target.value && restoreVersion(e.target.value)}>
                        <option value="">Restore version…</option>
                        {versions.map((v) => (
                            <option key={v.id} value={v.id}>v{v.version_number} · {v.type} · {new Date(v.created_at).toLocaleString()}</option>
                        ))}
                    </select>
                </div>
            )}
            <Button type="button" variant="danger" className="w-full" onClick={() => confirm('Delete?') && router.delete(`/admin/special-products/${page.id}`)}>
                <Trash2 size={14} /> Delete page
            </Button>
        </div>
    );

    return (
        <AdminLayout title={`Builder: ${page.name}`}>
            <FlashMessage />
            <LandingPageBuilder
                page={page}
                catalog={catalog}
                product={product}
                onSave={save}
                saving={form.processing}
                pageSettings={pageSettings}
                backHref="/admin/special-products"
                checkoutPreview={checkoutPreview}
            />
        </AdminLayout>
    );
}
