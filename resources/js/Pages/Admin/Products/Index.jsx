import { Link, router } from '@inertiajs/react';
import { Plus, Search, Copy, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import Pagination from '../../../Components/UI/Pagination';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody } from '../../../Components/UI/Card';
import clsx from 'clsx';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';

const statusVariant = {
    published: 'success',
    draft: 'warning',
    archived: 'default',
};

export default function ProductsIndex({ products, filters, categories, brands, statuses }) {
    const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

    const search = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        router.get('/admin/products', Object.fromEntries(form), { preserveState: true });
    };

    const destroy = (id) => {
        if (confirm('Delete this product?')) {
            router.delete(`/admin/products/${id}`);
        }
    };

    const duplicate = (id) => router.post(`/admin/products/${id}/duplicate`);

    return (
        <AdminLayout title="Products">
            <FlashMessage />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <form onSubmit={search} className="flex flex-1 gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            name="search"
                            defaultValue={filters.search || ''}
                            placeholder="Search name, SKU, barcode..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                        />
                    </div>
                    <Select
                        name="status"
                        defaultValue={filters.status || ''}
                        placeholder="All statuses"
                        options={statuses.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                        className="w-36"
                    />
                    <Select
                        name="category_id"
                        defaultValue={filters.category_id || ''}
                        placeholder="All categories"
                        options={categories}
                        className="w-40"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <input type="checkbox" name="low_stock" value="1" defaultChecked={filters.low_stock} className="rounded" />
                        Low stock
                    </label>
                    <Button type="submit" variant="secondary">Filter</Button>
                </form>
                <Link href="/admin/products/create">
                    <Button><Plus size={16} /> Add Product</Button>
                </Link>
            </div>

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500">
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">SKU</th>
                                <th className="px-6 py-3 font-medium">Category</th>
                                <th className="px-6 py-3 font-medium">Price</th>
                                <th className="px-6 py-3 font-medium">Stock</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {products.data?.length ? products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                                <ProductThumbnail product={product} size="sm" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-white">{product.name}</p>
                                                {product.is_featured && <Badge variant="info" className="mt-0.5">Featured</Badge>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.sku}</td>
                                    <td className="px-6 py-4 text-slate-500">{product.category?.name || '—'}</td>
                                    <td className="px-6 py-4 font-medium">{formatPrice(product.price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            'inline-flex items-center gap-1',
                                            product.is_low_stock && 'text-amber-600 font-medium'
                                        )}>
                                            {product.is_low_stock && <AlertTriangle size={14} />}
                                            {product.track_inventory ? product.stock_quantity : '∞'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusVariant[product.status]}>{product.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/admin/products/${product.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <Pencil size={16} />
                                            </Link>
                                            <button type="button" onClick={() => duplicate(product.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <Copy size={16} />
                                            </button>
                                            <button type="button" onClick={() => destroy(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                        No products found. <Link href="/admin/products/create" className="text-teal-700 font-medium">Create one</Link>
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
