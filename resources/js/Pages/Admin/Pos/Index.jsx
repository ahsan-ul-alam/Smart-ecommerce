import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import ProductThumbnail from '../../../Components/Catalog/ProductThumbnail';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function PosIndex({
    paymentMethods,
    categories = [],
    products: initialProducts = { data: [], total: 0, shown: 0 },
    productLimit = 30,
}) {
    const [query, setQuery] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [products, setProducts] = useState(initialProducts.data ?? []);
    const [meta, setMeta] = useState({ total: initialProducts.total ?? 0, shown: initialProducts.shown ?? 0 });
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [discount, setDiscount] = useState(0);
    const [processing, setProcessing] = useState(false);
    const skipInitialFetch = useRef(true);

    const fetchProducts = useCallback(async (q, cat, limit = productLimit) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: String(limit) });
            if (q.trim()) params.set('q', q.trim());
            if (cat) params.set('category_id', cat);
            const res = await fetch(`/admin/pos/search?${params}`);
            const json = await res.json();
            setProducts(json.data || []);
            setMeta({ total: json.total ?? 0, shown: json.shown ?? 0 });
        } finally {
            setLoading(false);
        }
    }, [productLimit]);

    useEffect(() => {
        if (skipInitialFetch.current && !query && !categoryId) {
            skipInitialFetch.current = false;
            return;
        }
        skipInitialFetch.current = false;

        const timer = setTimeout(() => {
            fetchProducts(query, categoryId);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, categoryId, fetchProducts]);

    const addToCart = (product, variant = null) => {
        const key = `${product.id}-${variant?.id ?? 'base'}`;
        setCart((prev) => {
            const existing = prev.find((i) => i.key === key);
            if (existing) {
                return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
            }
            const price = variant?.price ?? product.price;
            return [...prev, {
                key,
                product_id: product.id,
                product_variant_id: variant?.id ?? null,
                name: variant ? `${product.name} (${variant.name})` : product.name,
                product,
                unit_price: price,
                quantity: 1,
            }];
        });
    };

    const updateQty = (key, delta) => {
        setCart((prev) => prev
            .map((i) => (i.key === key ? { ...i, quantity: i.quantity + delta } : i))
            .filter((i) => i.quantity > 0));
    };

    const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const total = Math.max(0, subtotal - Number(discount || 0));

    const checkout = () => {
        setProcessing(true);
        router.post('/admin/pos', {
            customer_name: customerName || 'Walk-in Customer',
            customer_phone: customerPhone,
            payment_method: paymentMethod,
            discount: Number(discount) || 0,
            items: cart.map((i) => ({
                product_id: i.product_id,
                product_variant_id: i.product_variant_id,
                quantity: i.quantity,
            })),
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    const categoryOptions = [
        { value: '', label: 'All categories' },
        ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ];

    return (
        <AdminLayout title="Point of Sale">
            <FlashMessage />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                    <Card>
                        <CardBody>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, SKU, or barcode..."
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                                <div className="sm:w-52 shrink-0">
                                    <Select
                                        label="Category"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        options={categoryOptions}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-3">
                                Showing {meta.shown} of {meta.total} products
                                {query && ` matching "${query}"`}
                            </p>

                            {loading && <p className="text-sm text-slate-400 mt-2">Loading...</p>}

                            {!loading && products.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-12">No products found. Try another search or category.</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4 max-h-[520px] overflow-y-auto">
                                {products.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => addToCart(product)}
                                        className="text-left p-3 border rounded-xl hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors"
                                    >
                                        <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                                            <ProductThumbnail product={product} />
                                        </div>
                                        <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                                        <p className="text-xs text-slate-400 font-mono truncate">{product.sku}</p>
                                        <p className="text-teal-700 dark:text-teal-400 font-semibold text-sm mt-1">{formatPrice(product.price)}</p>
                                        {product.track_inventory && (
                                            <p className="text-xs text-slate-500 mt-0.5">Stock: {product.stock_quantity}</p>
                                        )}
                                        {product.variants?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {product.variants.map((v) => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); addToCart(product, v); }}
                                                        className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-teal-100"
                                                    >
                                                        {v.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {meta.total > meta.shown && !loading && (
                                <p className="text-xs text-center text-slate-400 mt-3">
                                    Use search or category filter to find more products ({meta.total - meta.shown} more available).
                                </p>
                            )}
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader title="Cart" />
                        <CardBody className="space-y-3">
                            {cart.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">Tap a product to add to cart</p>
                            ) : cart.map((item) => (
                                <div key={item.key} className="flex gap-2 items-start border-b pb-3 dark:border-slate-700">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-slate-500">{formatPrice(item.unit_price)} each</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => updateQty(item.key, -1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Minus size={14} /></button>
                                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                                        <button type="button" onClick={() => updateQty(item.key, 1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Plus size={14} /></button>
                                    </div>
                                    <button type="button" onClick={() => updateQty(item.key, -item.quantity)} className="p-1 text-red-500"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Customer & Payment" />
                        <CardBody className="space-y-3">
                            <Input label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in Customer" />
                            <Input label="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                            <Select label="Payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                options={paymentMethods.map((m) => ({ value: m.value, label: m.label }))} />
                            <Input label="Discount (৳)" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                            <div className="border-t pt-3 space-y-1 text-sm dark:border-slate-700">
                                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-teal-700 dark:text-teal-400">{formatPrice(total)}</span></div>
                            </div>
                            <Button className="w-full" onClick={checkout} loading={processing} disabled={cart.length === 0}>
                                <ShoppingBag size={16} /> Complete sale
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
