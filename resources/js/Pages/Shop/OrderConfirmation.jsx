import { Link } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import Button from '../../Components/UI/Button';
import { Card, CardBody } from '../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function OrderConfirmation({ order }) {
    return (
        <ShopLayout>
            <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Order Placed!</h1>
                <p className="text-slate-500 mb-8">Thank you for your order. We will contact you shortly.</p>

                <Card className="text-left mb-8">
                    <CardBody className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Order Number</span>
                            <span className="font-mono font-bold text-teal-700">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Payment</span>
                            <span>{order.payment_method_label}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Status</span>
                            <span className="capitalize">{order.status_label}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-3">
                            <span>Total</span>
                            <span className="text-teal-700">{formatPrice(order.total)}</span>
                        </div>
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs text-slate-500">
                                <span>{item.product_name} × {item.quantity}</span>
                                <span>{formatPrice(item.total)}</span>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                <div className="flex gap-4 justify-center">
                    <Link href="/shop/products"><Button variant="secondary">Continue Shopping</Button></Link>
                    <Link href="/"><Button>Go Home</Button></Link>
                </div>
            </div>
        </ShopLayout>
    );
}
