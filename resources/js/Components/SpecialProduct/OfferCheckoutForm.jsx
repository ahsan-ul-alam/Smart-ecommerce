import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import Input from '../UI/Input';
import Textarea from '../UI/Textarea';
import Button from '../UI/Button';
import BangladeshAddressFields from '../Address/BangladeshAddressFields';
import ProductPrice from '../Catalog/ProductPrice';

const formatPrice = (n) => `৳${Number(n ?? 0).toLocaleString('en-BD')}`;

export default function OfferCheckoutForm({
    slug,
    product,
    divisions = [],
    paymentMethods = [],
    initialTotals = {},
    title = 'Place your order',
    subtitle = 'Complete delivery & payment on this page',
    className = '',
}) {
    const variants = (product.variants ?? []).filter((v) => v.is_active !== false);
    const needsVariant = variants.length > 0;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        division: '',
        district: '',
        thana: '',
        local_address: '',
        postal_code: '',
        customer_note: '',
        payment_method: paymentMethods[0]?.value ?? 'cod',
        quantity: 1,
        variant_id: needsVariant ? String(variants[0]?.id ?? '') : '',
    });

    const [totals, setTotals] = useState(initialTotals);

    useEffect(() => {
        if (!data.district) return;

        const timer = setTimeout(() => {
            axios
                .post(`/offer/${slug}/shipping-preview`, {
                    district: data.district,
                    quantity: data.quantity,
                    variant_id: data.variant_id || null,
                })
                .then((res) => setTotals(res.data))
                .catch(() => {});
        }, 300);

        return () => clearTimeout(timer);
    }, [slug, data.district, data.quantity, data.variant_id]);

    const submit = (e) => {
        e.preventDefault();
        post(`/offer/${slug}/checkout`, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} id="offer-checkout" className={`offer-checkout-card ${className}`}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                {subtitle && <p className="text-slate-600 mt-1 text-sm">{subtitle}</p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Input label="Full name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                    <Input label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} required />
                    <Input label="Email (optional)" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                    <BangladeshAddressFields data={data} setData={setData} errors={errors} divisions={divisions} />
                    <Textarea label="Order note (optional)" value={data.customer_note} onChange={(e) => setData('customer_note', e.target.value)} rows={2} />

                    {needsVariant && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Option</label>
                            <select
                                value={data.variant_id}
                                onChange={(e) => setData('variant_id', e.target.value)}
                                className="input-premium w-full"
                            >
                                {variants.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name} — {formatPrice(v.price)}</option>
                                ))}
                            </select>
                            {errors.variant_id && <p className="text-xs text-red-600 mt-1">{errors.variant_id}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={data.quantity}
                            onChange={(e) => setData('quantity', Math.max(1, Number(e.target.value)))}
                            className="input-premium w-24"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <ProductPrice product={product} className="text-xl font-bold text-[var(--offer-primary)]" />
                        <div className="text-sm space-y-1.5 border-t pt-3">
                            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(totals.shipping)}</span></div>
                            {totals.tax > 0 && (
                                <div className="flex justify-between"><span>{totals.tax_label || 'Tax'}</span><span>{formatPrice(totals.tax)}</span></div>
                            )}
                            <div className="flex justify-between font-bold text-base pt-2 border-t">
                                <span>Total</span>
                                <span className="text-[var(--offer-primary)]">{formatPrice(totals.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Payment method</p>
                        <div className="space-y-2">
                            {paymentMethods.map((m) => (
                                <label key={m.value} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-[var(--offer-primary)]/40 has-[:checked]:border-[var(--offer-primary)] has-[:checked]:bg-[var(--offer-primary)]/5">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={m.value}
                                        checked={data.payment_method === m.value}
                                        onChange={() => setData('payment_method', m.value)}
                                    />
                                    <span className="text-sm font-medium">{m.label}</span>
                                </label>
                            ))}
                        </div>
                        {errors.payment_method && <p className="text-xs text-red-600 mt-1">{errors.payment_method}</p>}
                    </div>

                    <Button type="submit" loading={processing} className="w-full py-3.5 text-base gap-2">
                        <ShoppingBag size={20} />
                        Confirm order — {formatPrice(totals.total)}
                    </Button>
                    <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                        <ShieldCheck size={14} /> Your information is used only for this order
                    </p>
                </div>
            </div>
        </form>
    );
}
