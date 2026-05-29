import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Layout } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody } from '../../../Components/UI/Card';

export default function SpecialProductsIndex({ pages, products }) {
    const [creating, setCreating] = useState(false);
    const form = useForm({ name: '', product_id: products[0]?.id ? String(products[0].id) : '' });

    const submitCreate = (e) => {
        e.preventDefault();
        form.post('/admin/special-products', {
            onSuccess: () => {
                setCreating(false);
                form.reset();
            },
        });
    };

    return (
        <AdminLayout title="Special Product">
            <FlashMessage />
            <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Special product landings</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Build high-converting single-product pages with guest checkout and payment on one page.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}><Plus size={16} /> New landing</Button>
            </div>

            {creating && (
                <Card className="mb-6">
                    <form onSubmit={submitCreate} className="p-6 flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Input label="Campaign name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                        </div>
                        <div className="min-w-[200px]">
                            <Select
                                label="Product"
                                value={form.data.product_id}
                                onChange={(e) => form.setData('product_id', e.target.value)}
                                options={products.map((p) => ({ value: String(p.id), label: p.name }))}
                                required
                            />
                        </div>
                        <Button type="submit" loading={form.processing}>Create & open builder</Button>
                        <Button type="button" variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
                    </form>
                </Card>
            )}

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Campaign</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Orders</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pages.data?.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-3 font-medium">{p.name}</td>
                                    <td className="px-6 py-3">{p.product?.name}</td>
                                    <td className="px-6 py-3 tabular-nums">{p.orders_count ?? 0}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={p.is_published ? 'success' : 'default'}>
                                            {p.is_published ? 'Live' : 'Draft'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {p.is_published && (
                                                <a href={`/offer/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 rounded-lg" title="View live">
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <Link href={`/admin/special-products/${p.id}/edit`} className="p-2 hover:bg-slate-100 rounded-lg inline-flex" title="Open builder">
                                                <Layout size={14} />
                                            </Link>
                                            <Button variant="ghost" onClick={() => confirm('Delete?') && router.delete(`/admin/special-products/${p.id}`)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
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
