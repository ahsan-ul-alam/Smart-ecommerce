import { useForm } from '@inertiajs/react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import { Card, CardBody, CardHeader } from '../UI/Card';

export default function ProductInventoryPanel({ product, movementTypes, inventoryMovements = [] }) {
    const form = useForm({ type: 'restock', quantity: 1, notes: '' });

    if (!product?.track_inventory) {
        return null;
    }

    const submit = (e) => {
        e.preventDefault();
        form.post(`/admin/products/${product.id}/inventory`, {
            preserveScroll: true,
            onSuccess: () => form.reset('quantity', 'notes'),
        });
    };

    return (
        <Card>
            <CardHeader title="Inventory" subtitle={`Current stock: ${product.stock_quantity}`} />
            <CardBody className="space-y-4">
                <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <Select label="Type" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}
                        options={movementTypes} />
                    <Input label="Quantity" type="number" min="1" value={form.data.quantity}
                        onChange={(e) => form.setData('quantity', e.target.value)} />
                    <Button type="submit" loading={form.processing}>Apply</Button>
                    <div className="sm:col-span-3">
                        <Textarea label="Notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={2} />
                    </div>
                </form>

                {inventoryMovements.length > 0 && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Recent movements</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                            {inventoryMovements.map((m) => (
                                <div key={m.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>{m.type_label} × {m.quantity}</span>
                                    <span>{m.stock_before} → {m.stock_after}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
