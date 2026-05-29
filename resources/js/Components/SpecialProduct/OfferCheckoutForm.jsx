import {
    User, MapPin, Wallet, ShoppingBag, Phone, Mail, Lock, ArrowRight,
    Check, Minus, Plus, Headphones,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import clsx from 'clsx';
import BangladeshAddressFields from '../Address/BangladeshAddressFields';
import ProductThumbnail from '../Catalog/ProductThumbnail';

const formatPrice = (n) => `৳${Number(n ?? 0).toLocaleString('en-BD')}`;

const PAYMENT_STYLES = {
    cod: { ring: 'ring-emerald-500', bg: 'bg-emerald-50', accent: 'text-emerald-700', badge: 'bg-emerald-500' },
    bkash: { ring: 'ring-pink-500', bg: 'bg-pink-50', accent: 'text-pink-700', badge: 'bg-pink-500' },
    nagad: { ring: 'ring-orange-500', bg: 'bg-orange-50', accent: 'text-orange-700', badge: 'bg-orange-500' },
    sslcommerz: { ring: 'ring-slate-500', bg: 'bg-slate-50', accent: 'text-slate-700', badge: 'bg-slate-600' },
    aamarpay: { ring: 'ring-indigo-500', bg: 'bg-indigo-50', accent: 'text-indigo-700', badge: 'bg-indigo-600' },
    stripe: { ring: 'ring-violet-500', bg: 'bg-violet-50', accent: 'text-violet-700', badge: 'bg-violet-600' },
    paypal: { ring: 'ring-blue-500', bg: 'bg-blue-50', accent: 'text-blue-700', badge: 'bg-blue-600' },
};

function paymentLabel(method) {
    const map = {
        cod: { title: 'Cash on Delivery', sub: 'Pay when you receive' },
        bkash: { title: 'bKash', sub: 'Mobile wallet payment' },
        nagad: { title: 'Nagad', sub: 'Mobile wallet payment' },
        sslcommerz: { title: 'Online Payment', sub: 'Card / bank gateway' },
        aamarpay: { title: 'Online Payment', sub: 'Card / bank gateway' },
        stripe: { title: 'Online Payment', sub: 'Card payment' },
        paypal: { title: 'PayPal', sub: 'Online payment' },
    };
    return map[method.value] ?? { title: method.label, sub: 'Secure payment' };
}

function PaymentMethodPicker({ methods, value, onChange, disabled, error }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Wallet size={18} className="text-[var(--offer-primary)]" />
                <h3 className="font-bold text-slate-900">Payment Method</h3>
            </div>
            <p className="mb-3 text-xs text-slate-500">Select your preferred payment method</p>
            <div className="grid grid-cols-1 gap-2.5">
                {methods.map((method) => {
                    const selected = value === method.value;
                    const style = PAYMENT_STYLES[method.value] ?? PAYMENT_STYLES.sslcommerz;
                    const labels = paymentLabel(method);
                    return (
                        <button
                            key={method.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(method.value)}
                            className={clsx(
                                'relative text-left rounded-xl border-2 p-3.5 transition-all',
                                selected
                                    ? clsx('border-transparent ring-2', style.ring, style.bg)
                                    : 'border-slate-200 bg-white hover:border-slate-300',
                            )}
                        >
                            {selected && (
                                <span className={clsx('absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-white', style.badge)}>
                                    <Check size={12} strokeWidth={3} />
                                </span>
                            )}
                            <p className={clsx('font-bold text-sm pr-6', selected ? style.accent : 'text-slate-900')}>
                                {labels.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{labels.sub}</p>
                        </button>
                    );
                })}
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function FormSection({ icon: Icon, title, children }) {
    return (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--offer-primary-light)] text-[var(--offer-primary)]">
                    <Icon size={18} />
                </span>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
            </div>
            {children}
        </section>
    );
}

function FieldLabel({ children, required }) {
    return (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {children}
            {required && <span className="text-red-500"> *</span>}
        </label>
    );
}

function TextField({ label, required, error, icon: Icon, ...props }) {
    return (
        <div>
            <FieldLabel required={required}>{label}</FieldLabel>
            <div className="relative">
                {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                <input
                    className={clsx(
                        'input-premium w-full',
                        Icon && 'pl-10',
                        error && 'border-red-400',
                    )}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function OfferCheckoutForm({
    slug,
    product,
    divisions = [],
    paymentMethods = [],
    initialTotals = {},
    title = 'Order Form',
    subtitle = 'Enter your name, address, and phone — Cash on Delivery available',
    supportPhone = '01773766658',
    supportHours = '9AM – 10PM',
    preview = false,
    className = '',
}) {
    const variants = (product?.variants ?? []).filter((v) => v.is_active !== false);
    const needsVariant = variants.length > 0;
    const methods = paymentMethods.length ? paymentMethods : [{ value: 'cod', label: 'Cash on Delivery' }];

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
        payment_method: methods[0]?.value ?? 'cod',
        quantity: 1,
        variant_id: needsVariant ? String(variants[0]?.id ?? '') : '',
    });

    const [totals, setTotals] = useState(initialTotals);

    useEffect(() => {
        setTotals(initialTotals);
    }, [initialTotals]);

    useEffect(() => {
        if (preview || !data.district) return undefined;

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
    }, [slug, data.district, data.quantity, data.variant_id, preview]);

    const selectedVariant = useMemo(
        () => variants.find((v) => String(v.id) === String(data.variant_id)),
        [variants, data.variant_id],
    );

    const unitPrice = totals.unit_price ?? selectedVariant?.price ?? product?.price ?? 0;
    const listPrice = product?.compare_price ?? product?.original_price ?? 0;
    const lineSave = listPrice > unitPrice ? listPrice - unitPrice : 0;

    const productSubtitle = selectedVariant?.name
        ?? product?.short_description
        ?? [product?.sku].filter(Boolean).join(' • ');

    const submit = (e) => {
        e.preventDefault();
        if (preview) return;
        post(`/offer/${slug}/checkout`, { preserveScroll: true });
    };

    const adjustQty = (delta) => {
        setData('quantity', Math.min(20, Math.max(1, data.quantity + delta)));
    };

    return (
        <form
            onSubmit={submit}
            id="offer-checkout"
            className={clsx(
                'offer-checkout-card w-full',
                preview ? 'scroll-mt-0' : 'scroll-mt-24',
                className,
            )}
        >
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-5 xl:grid-cols-3 lg:gap-6 lg:items-start">
                {/* Right rail — one sticky column on desktop; children participate in mobile flex order */}
                <div className={clsx(
                    'contents lg:flex lg:flex-col lg:gap-4',
                    'lg:col-span-2 xl:col-span-1 lg:col-start-4 xl:col-start-3 lg:row-start-1 lg:self-start',
                    !preview && 'lg:sticky lg:top-20',
                )}>
                    {/* 1 — Order summary */}
                    <div className="order-1 lg:order-none">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                            <ShoppingBag size={18} className="text-[var(--offer-primary)]" />
                            <h3 className="font-bold text-slate-900">Order Summary</h3>
                        </div>

                        <div className="flex gap-3 pb-4 border-b border-slate-100">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                <ProductThumbnail product={product} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-slate-900 line-clamp-2">{product?.name}</p>
                                {productSubtitle && (
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{productSubtitle}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="font-bold text-[var(--offer-primary)]">{formatPrice(unitPrice)}</span>
                                    {listPrice > unitPrice && (
                                        <span className="text-xs text-slate-400 line-through">{formatPrice(listPrice)}</span>
                                    )}
                                    {lineSave > 0 && (
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                            Save {formatPrice(lineSave)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                                        <button type="button" disabled={preview || data.quantity <= 1} onClick={() => adjustQty(-1)} className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30">
                                            <Minus size={14} />
                                        </button>
                                        <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">{data.quantity}</span>
                                        <button type="button" disabled={preview || data.quantity >= 20} onClick={() => adjustQty(1)} className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <dl className="space-y-2.5 text-sm py-4 border-b border-slate-100">
                            <div className="flex justify-between text-slate-600">
                                <dt>Subtotal</dt>
                                <dd className="font-medium text-slate-900">{formatPrice(totals.subtotal ?? unitPrice * data.quantity)}</dd>
                            </div>
                            {Number(totals.discount) > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <dt>Discount</dt>
                                    <dd className="font-medium">−{formatPrice(totals.discount)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                                <dt>Shipping charge</dt>
                                <dd className="font-medium text-slate-900">{formatPrice(totals.shipping ?? 0)}</dd>
                            </div>
                            {Number(totals.tax) > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <dt>{totals.tax_label || 'Tax'}</dt>
                                    <dd className="font-medium text-slate-900">{formatPrice(totals.tax)}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="flex justify-between items-center pt-4">
                            <span className="font-bold text-slate-900">Total (BDT)</span>
                            <span className="text-2xl font-bold text-[var(--offer-primary)]">{formatPrice(totals.total)}</span>
                        </div>
                        </div>
                    </div>

                    {/* 4 — Payment method */}
                    <div className="order-5 lg:order-none space-y-4">
                        <PaymentMethodPicker
                            methods={methods}
                            value={data.payment_method}
                            onChange={(val) => setData('payment_method', val)}
                            disabled={preview}
                            error={errors.payment_method}
                        />

                        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 flex gap-3">
                            <Headphones size={20} className="text-sky-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Need help? Contact us</p>
                                <a href={`tel:${supportPhone}`} className="text-lg font-bold text-[var(--offer-primary)]">{supportPhone}</a>
                                <p className="text-xs text-slate-500 mt-0.5">({supportHours})</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left column — one grid cell on desktop; children keep mobile flex order */}
                <div className="contents lg:flex lg:flex-col lg:gap-5 lg:col-span-3 xl:col-span-2 lg:col-start-1 lg:row-start-1">
                    {/* 2 — Customer information */}
                    <div className="order-2 lg:order-none space-y-5">
                        <header className="px-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h2>
                            {subtitle && <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{subtitle}</p>}
                        </header>

                        <FormSection icon={User} title="Customer Information">
                            <div className="space-y-4">
                                <TextField
                                    label="Full name"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    placeholder="Enter your name"
                                    disabled={preview}
                                />
                                <TextField
                                    label="Phone number"
                                    required
                                    icon={Phone}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                    placeholder="01XXXXXXXXX"
                                    disabled={preview}
                                />
                                <TextField
                                    label="Email address (optional)"
                                    icon={Mail}
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="example@gmail.com"
                                    disabled={preview}
                                />
                            </div>
                        </FormSection>
                    </div>

                    {/* 3 — Delivery address */}
                    <div className="order-3 lg:order-none">
                        <FormSection icon={MapPin} title="Delivery Address">
                            <div className="space-y-4">
                                <BangladeshAddressFields
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    divisions={divisions}
                                    layout="grid"
                                    disabled={preview}
                                />
                                <div>
                                    <FieldLabel>Order note (optional)</FieldLabel>
                                    <textarea
                                        rows={2}
                                        value={data.customer_note}
                                        onChange={(e) => setData('customer_note', e.target.value)}
                                        disabled={preview}
                                        placeholder="Any special delivery instructions…"
                                        className="input-premium w-full"
                                    />
                                </div>
                            </div>
                        </FormSection>
                    </div>

                    {needsVariant && (
                        <div className="order-4 lg:order-none rounded-2xl border border-slate-200 bg-white p-5">
                            <FieldLabel required>Product option</FieldLabel>
                            <select
                                value={data.variant_id}
                                onChange={(e) => setData('variant_id', e.target.value)}
                                disabled={preview}
                                className="input-premium w-full"
                            >
                                {variants.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name} — {formatPrice(v.price)}</option>
                                ))}
                            </select>
                            {errors.variant_id && <p className="mt-1 text-xs text-red-600">{errors.variant_id}</p>}
                        </div>
                    )}

                    {/* 5 — Confirm order */}
                    <div className="order-6 lg:order-none space-y-2 pt-1">
                        <button
                            type="submit"
                            disabled={preview || processing}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--offer-primary)] px-6 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
                        >
                            <Lock size={18} />
                            Confirm Order — {formatPrice(totals.total)}
                            <ArrowRight size={18} />
                        </button>
                        <p className="text-center text-xs text-slate-500">
                            You will receive a confirmation after placing your order
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
