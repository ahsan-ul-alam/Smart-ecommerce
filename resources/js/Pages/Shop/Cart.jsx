import { Link, router } from '@inertiajs/react';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '../../Layouts/ShopLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';
import ProductThumbnail from '../../Components/Catalog/ProductThumbnail';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function Cart({ cart }) {
    const [couponCode, setCouponCode] = useState('');

    const updateQty = (itemId, quantity) => {
        router.patch(`/shop/cart/${itemId}`, { quantity }, { preserveScroll: true });
    };

    const removeItem = (itemId) => router.delete(`/shop/cart/${itemId}`, { preserveScroll: true });

    const applyCoupon = (e) => {
        e.preventDefault();
        router.post('/shop/cart/coupon', { code: couponCode }, { preserveScroll: true });
    };

    const { totals, items } = cart;

    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500 mb-4">Your cart is empty</p>
                        <Link href="/shop/products">
                            <Button>Continue Shopping</Button>
                        </Link>
                    </div>
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
                                <CardHeader title="Coupon Code" />
                                <CardBody>
                                    {cart.coupon ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                                                <Tag size={14} /> {cart.coupon.code}
                                            </span>
                                            <button type="button" onClick={() => router.delete('/shop/cart/coupon')} className="text-xs text-red-500">Remove</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={applyCoupon} className="flex gap-2">
                                            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="WELCOME10" className="flex-1" />
                                            <Button type="submit" variant="secondary">Apply</Button>
                                        </form>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
