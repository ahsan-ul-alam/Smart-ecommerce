import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import ShopPageHeader from '../../Components/Shop/ShopPageHeader';
import Button from '../../Components/UI/Button';
import EmptyState from '../../Components/UI/EmptyState';
import { ShoppingBag } from 'lucide-react';
import PromoCodeForm from '../../Components/Shop/PromoCodeForm';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';
import ProductThumbnail from '../../Components/Catalog/ProductThumbnail';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function Cart({ cart: initialCart }) {
    const [cart, setCart] = useState(initialCart);

    useEffect(() => {
        setCart(initialCart);
    }, [initialCart]);

    const handleCartUpdate = (updatedCart) => {
        setCart(updatedCart);
    };

    const updateQty = (itemId, quantity) => {
        router.patch(`/shop/cart/${itemId}`, { quantity }, { preserveScroll: true });
    };

    const removeItem = (itemId) => router.delete(`/shop/cart/${itemId}`, { preserveScroll: true });

    const { totals, items } = cart;

    return (
        <ShopLayout>
            <ShopPageHeader
                title="Shopping cart"
                description={items.length ? `${items.length} item${items.length !== 1 ? 's' : ''} in your cart` : 'Your cart is waiting for your first item.'}
                breadcrumbs={[{ label: 'Shop', href: '/shop/products' }, { label: 'Cart' }]}
            />

                {items.length === 0 ? (
                    <EmptyState
                        icon={ShoppingBag}
                        title="Your cart is empty"
                        description="Browse our catalog and add products you love."
                        action={<Link href="/shop/products"><Button>Continue shopping</Button></Link>}
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <Card key={item.id}>
                                    <CardBody className="flex gap-4">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                                            <ProductThumbnail product={{ name: item.name, image: item.image }} size="sm" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/shop/products/${item.slug}`} className="font-medium text-slate-800 dark:text-white hover:text-teal-700">
                                                {item.name}
                                            </Link>
                                            <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                                            <p className="text-teal-700 font-bold mt-1">{formatPrice(item.unit_price)}</p>
                                            {item.free_shipping ? (
                                                <p className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    <Truck size={13} /> Free delivery
                                                </p>
                                            ) : item.shipping_charge != null && (
                                                <p className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-slate-500">
                                                    <Truck size={13} /> Delivery: {formatPrice(item.shipping_charge)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
                                                <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1.5 hover:bg-slate-100 rounded-l-lg">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1.5 hover:bg-slate-100 rounded-r-lg">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm">{formatPrice(item.line_total)}</p>
                                            <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader title="Order Summary" />
                                <CardBody className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
                                    {totals.discount > 0 && (
                                        <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(totals.discount)}</span></div>
                                    )}
                                    <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span></div>
                                    {totals.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">{totals.tax_label || 'Tax'}</span>
                                            <span>{formatPrice(totals.tax)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t pt-3">
                                        <span>Total</span><span className="text-teal-700">{formatPrice(totals.total)}</span>
                                    </div>
                                    <Link href="/shop/checkout" className="block">
                                        <Button className="w-full mt-2">Proceed to Checkout</Button>
                                    </Link>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardHeader title="Coupon Code" subtitle="Try WELCOME10 for 10% off orders over ৳500" />
                                <CardBody>
                                    <PromoCodeForm cart={cart} onCartUpdate={handleCartUpdate} />
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}
        </ShopLayout>
    );
}
