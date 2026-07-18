import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Textarea from '../../../Components/UI/Textarea';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import ProductImageManager from '../../../Components/Admin/ProductImageManager';
import ProductInventoryPanel from '../../../Components/Admin/ProductInventoryPanel';
import ProductVariantsPanel from '../../../Components/Admin/ProductVariantsPanel';

const defaultProduct = {
    name: '', slug: '', sku: '', barcode: '',
    category_id: '', brand_id: '', vendor_id: '',
    short_description: '', description: '',
    type: 'physical', status: 'draft',
    price: 0, compare_price: '', cost_price: '',
    stock_quantity: 0, low_stock_threshold: 5,
    track_inventory: true, is_featured: false,
    free_shipping: false, shipping_charge: '',
    weight: '', tags: [], seo_title: '', seo_description: '',
};

export default function ProductForm({ product, categories, brands, vendors = [], inventoryMovements = [], movementTypes = [] }) {
    const isEdit = !!product?.id;

    const { data, setData, post, put, processing, errors } = useForm(
        product ? { ...defaultProduct, ...product, category_id: product.category_id || '', brand_id: product.brand_id || '', vendor_id: product.vendor_id || '' } : defaultProduct
    );

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/products/${product.id}`);
        } else {
            post('/admin/products');
        }
    };

    return (
        <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
            <FlashMessage />

            <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-4">
                <ArrowLeft size={16} /> Back to products
            </Link>

            <form onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader title="Basic Information" />
                        <CardBody className="space-y-4">
                            <Input label="Product Name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} placeholder="auto-generated" />
                                <Input label="SKU" value={data.sku} onChange={(e) => setData('sku', e.target.value)} error={errors.sku} />
                            </div>
                            <Input label="Barcode" value={data.barcode} onChange={(e) => setData('barcode', e.target.value)} error={errors.barcode} />
                            <Textarea label="Short Description" value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} error={errors.short_description} rows={2} />
                            <Textarea label="Description" value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Pricing & Inventory" />
                        <CardBody className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Input label="Price (৳)" type="number" min="0" step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} error={errors.price} required />
                                <Input label="Compare Price" type="number" min="0" step="0.01" value={data.compare_price} onChange={(e) => setData('compare_price', e.target.value)} />
                                <Input label="Cost Price" type="number" min="0" step="0.01" value={data.cost_price} onChange={(e) => setData('cost_price', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Stock Quantity" type="number" min="0" value={data.stock_quantity} onChange={(e) => setData('stock_quantity', e.target.value)} error={errors.stock_quantity} />
                                <Input label="Low Stock Alert" type="number" min="0" value={data.low_stock_threshold} onChange={(e) => setData('low_stock_threshold', e.target.value)} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={data.track_inventory} onChange={(e) => setData('track_inventory', e.target.checked)} className="rounded" />
                                Track inventory
                            </label>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="SEO" />
                        <CardBody className="space-y-4">
                            <Input label="SEO Title" value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} />
                            <Textarea label="SEO Description" value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} rows={2} />
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    {isEdit && <ProductImageManager product={product} />}
                    {isEdit && <ProductVariantsPanel product={product} variants={product.variants ?? []} />}
                    {isEdit && (
                        <ProductInventoryPanel
                            product={product}
                            movementTypes={movementTypes}
                            inventoryMovements={inventoryMovements}
                        />
                    )}

                    <Card>
                        <CardHeader title="Publish" />
                        <CardBody className="space-y-4">
                            <Select
                                label="Status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                options={[
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'published', label: 'Published' },
                                    { value: 'archived', label: 'Archived' },
                                ]}
                            />
                            <Select
                                label="Type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                options={[
                                    { value: 'physical', label: 'Physical' },
                                    { value: 'digital', label: 'Digital' },
                                ]}
                            />
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="rounded" />
                                Featured product
                            </label>
                            <Button type="submit" loading={processing} className="w-full">
                                {isEdit ? 'Update Product' : 'Create Product'}
                            </Button>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Organization" />
                        <CardBody className="space-y-4">
                            <Select
                                label="Category"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                placeholder="Select category"
                                options={categories}
                            />
                            <Select
                                label="Brand"
                                value={data.brand_id}
                                onChange={(e) => setData('brand_id', e.target.value)}
                                placeholder="Select brand"
                                options={brands}
                            />
                            {vendors.length > 0 && (
                                <Select
                                    label="Vendor"
                                    value={data.vendor_id}
                                    onChange={(e) => setData('vendor_id', e.target.value)}
                                    placeholder="Store default"
                                    options={vendors}
                                />
                            )}
                            <Input label="Weight (kg)" type="number" min="0" step="0.01" value={data.weight} onChange={(e) => setData('weight', e.target.value)} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Delivery" />
                        <CardBody className="space-y-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.free_shipping}
                                    onChange={(e) => setData('free_shipping', e.target.checked)}
                                    className="rounded"
                                />
                                Free delivery for this product
                            </label>
                            <Input
                                label="Custom delivery charge (৳)"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.shipping_charge ?? ''}
                                onChange={(e) => setData('shipping_charge', e.target.value)}
                                placeholder="Leave blank for default shipping"
                                disabled={data.free_shipping}
                                error={errors.shipping_charge}
                            />
                            <p className="text-xs text-slate-500">
                                Free delivery overrides everything. Otherwise a custom charge replaces the standard
                                delivery fee for orders containing this product. Leave blank to use the normal zone rate.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
