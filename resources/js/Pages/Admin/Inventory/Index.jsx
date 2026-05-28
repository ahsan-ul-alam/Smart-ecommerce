import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { AlertTriangle, Mail } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Badge from '../../../Components/UI/Badge';
import Button from '../../../Components/UI/Button';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody } from '../../../Components/UI/Card';

export default function InventoryIndex({ products }) {
    const [quantities, setQuantities] = useState({});

    const restock = (productId) => {
        const qty = Number(quantities[productId] || 0);
        if (qty < 1) return;
        router.post(`/admin/inventory/${productId}/restock`, { quantity: qty }, {
            preserveScroll: true,
            onSuccess: () => setQuantities((prev) => ({ ...prev, [productId]: '' })),
        });
    };

    const sendAlert = () => {
        if (confirm('Send low stock alert email now?')) {
            router.post('/admin/inventory/alert', {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Low Stock">
            <FlashMessage />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <p className="text-slate-500">Products at or below their low-stock threshold.</p>
                <Button variant="secondary" onClick={sendAlert}>
                    <Mail size={16} /> Send alert email
                </Button>
            </div>

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">SKU</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3">Threshold</th>
                                <th className="px-6 py-3 text-right">Quick restock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.data?.length ? products.data.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-3 font-medium">
                                        <span className="flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                                            <Link href={`/admin/products/${p.id}/edit`} className="hover:text-teal-700">{p.name}</Link>
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-xs">{p.sku}</td>
                                    <td className="px-6 py-3">{p.category || '—'}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant="warning">{p.stock_quantity}</Badge>
                                    </td>
                                    <td className="px-6 py-3">{p.low_stock_threshold}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex justify-end gap-2 items-center">
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Qty"
                                                className="w-20 px-2 py-1.5 rounded border text-sm dark:bg-slate-800 dark:border-slate-600"
                                                value={quantities[p.id] ?? ''}
                                                onChange={(e) => setQuantities((prev) => ({ ...prev, [p.id]: e.target.value }))}
                                            />
                                            <Button variant="secondary" onClick={() => restock(p.id)}>Add</Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        All products are above low-stock levels.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Pagination links={products.links} meta={products.meta} />
        </AdminLayout>
    );
}
