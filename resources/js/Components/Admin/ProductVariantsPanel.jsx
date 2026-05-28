import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { Card, CardBody, CardHeader } from '../UI/Card';

const emptyVariant = () => ({
    id: null,
    name: '',
    sku: '',
    price: '',
    stock_quantity: 0,
    size: '',
    color: '',
    is_active: true,
});

export default function ProductVariantsPanel({ product, variants = [] }) {
    const { data, setData, post, processing } = useForm({
        variants: variants.length ? variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku ?? '',
            price: v.price ?? '',
            stock_quantity: v.stock_quantity ?? 0,
            size: v.attributes?.size ?? '',
            color: v.attributes?.color ?? '',
            is_active: v.is_active ?? true,
        })) : [emptyVariant()],
    });

    const addRow = () => setData('variants', [...data.variants, emptyVariant()]);

    const removeRow = (index) => {
        const next = data.variants.filter((_, i) => i !== index);
        setData('variants', next.length ? next : [emptyVariant()]);
    };

    const updateRow = (index, field, value) => {
        const next = [...data.variants];
        next[index] = { ...next[index], [field]: value };
        setData('variants', next);
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/products/${product.id}/variants`);
    };

    return (
        <Card>
            <CardHeader title="Product Variants" subtitle="Size, color, or other options with separate stock and price" />
            <CardBody>
                <form onSubmit={submit} className="space-y-4">
                    {data.variants.map((row, index) => (
                        <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Variant {index + 1}</span>
                                {data.variants.length > 1 && (
                                    <button type="button" onClick={() => removeRow(index)} className="text-red-600 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Label" value={row.name} onChange={(e) => updateRow(index, 'name', e.target.value)} placeholder="e.g. Large / Red" required />
                                <Input label="SKU" value={row.sku} onChange={(e) => updateRow(index, 'sku', e.target.value)} />
                                <Input label="Price (৳)" type="number" min="0" step="0.01" value={row.price} onChange={(e) => updateRow(index, 'price', e.target.value)} placeholder="Uses product price if empty" />
                                <Input label="Stock" type="number" min="0" value={row.stock_quantity} onChange={(e) => updateRow(index, 'stock_quantity', e.target.value)} />
                                <Input label="Size" value={row.size} onChange={(e) => updateRow(index, 'size', e.target.value)} />
                                <Input label="Color" value={row.color} onChange={(e) => updateRow(index, 'color', e.target.value)} />
                            </div>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={addRow}>
                            <Plus size={16} className="mr-1" /> Add variant
                        </Button>
                        <Button type="submit" loading={processing}>Save variants</Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
