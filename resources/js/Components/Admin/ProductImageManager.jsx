import { router, useForm } from '@inertiajs/react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import Button from '../UI/Button';
import { Card, CardBody, CardHeader } from '../UI/Card';

export default function ProductImageManager({ product }) {
    const form = useForm({ images: [] });

    const upload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        form.setData('images', files);
        form.post(`/admin/products/${product.id}/images`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                e.target.value = '';
            },
        });
    };

    const remove = (imageId) => {
        if (!confirm('Remove this image?')) return;
        router.delete(`/admin/products/${product.id}/images/${imageId}`, { preserveScroll: true });
    };

    const setPrimary = (imageId) => {
        router.patch(`/admin/products/${product.id}/images/${imageId}/primary`, {}, { preserveScroll: true });
    };

    const images = product.images ?? [];

    return (
        <Card>
            <CardHeader title="Product Images" />
            <CardBody className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <ImagePlus size={32} className="text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Click to upload (JPEG, PNG, WebP — max 5MB each)</span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={upload}
                        disabled={form.processing}
                    />
                </label>
                {form.processing && <p className="text-sm text-teal-700">Uploading...</p>}

                {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((img) => (
                            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img src={img.url} alt={img.alt || product.name} className="aspect-square object-cover w-full" />
                                {img.is_primary && (
                                    <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">Primary</span>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {!img.is_primary && (
                                        <Button type="button" variant="secondary" onClick={() => setPrimary(img.id)} title="Set primary">
                                            <Star size={14} />
                                        </Button>
                                    )}
                                    <Button type="button" variant="secondary" onClick={() => remove(img.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">No images yet. Upload at least one for the shop listing.</p>
                )}
            </CardBody>
        </Card>
    );
}
