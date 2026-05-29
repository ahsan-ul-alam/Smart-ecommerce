import { Link, Head } from '@inertiajs/react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import OfferLayout from '../../Layouts/OfferLayout';

const formatPrice = (n) => `৳${Number(n ?? 0).toLocaleString('en-BD')}`;

export default function OfferOrderResult({ page, success, order }) {
    return (
        <OfferLayout page={page} theme={page.theme ?? {}}>
            <Head title={success ? 'Order confirmed' : 'Payment issue'} />

            <div className="max-w-lg mx-auto px-4 py-16 sm:py-24 text-center">
                {success ? (
                    <>
                        <CheckCircle size={72} className="mx-auto text-emerald-500 mb-6" />
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Thank you!</h1>
                        <p className="text-slate-600 mb-8">Your order has been received. We will contact you shortly.</p>
                    </>
                ) : (
                    <>
                        <XCircle size={72} className="mx-auto text-red-500 mb-6" />
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-600 mb-8">
                            Payment could not be completed or was cancelled. You can try again below.
                        </p>
                    </>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left space-y-3 mb-8 shadow-sm">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Order</span>
                        <span className="font-mono font-bold">{order.order_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Payment</span>
                        <span>{order.payment_method_label}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-3">
                        <span>Total</span>
                        <span className="text-[var(--offer-primary)]">{formatPrice(order.total)}</span>
                    </div>
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-slate-500">
                            <span>{item.product_name} × {item.quantity}</span>
                            <span>{formatPrice(item.total)}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {!success && (
                        <Link
                            href={`/offer/${page.slug}#offer-checkout`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--offer-primary)] text-white font-semibold"
                        >
                            Try again <ArrowRight size={16} />
                        </Link>
                    )}
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border font-semibold text-sm">
                        Back to store
                    </Link>
                </div>
            </div>
        </OfferLayout>
    );
}
