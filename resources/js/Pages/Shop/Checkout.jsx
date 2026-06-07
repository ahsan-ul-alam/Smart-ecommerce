import { useEffect, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Tag } from 'lucide-react';
import clsx from 'clsx';
import ShopLayout from '../../Layouts/ShopLayout';
import BangladeshAddressFields from '../../Components/Address/BangladeshAddressFields';
import CheckoutPaymentPicker from '../../Components/Shop/CheckoutPaymentPicker';
import ProductThumbnail from '../../Components/Catalog/ProductThumbnail';
import PromoCodeForm from '../../Components/Shop/PromoCodeForm';
import Input from '../../Components/UI/Input';
import Button from '../../Components/UI/Button';

const formatPrice = (n) => `৳${Number(n ?? 0).toLocaleString('en-BD')}`;

const fieldLabelClass = 'block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

const emptyAddress = {
    division: '',
    district: '',
    thana: '',
    local_address: '',
    postal_code: '',
};

const defaultTotals = {
    subtotal: 0,
    discount: 0,
    campaign_discount: 0,
    coupon_discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
};

function CheckoutSection({ step, title, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-5 flex items-center gap-3">
                {step != null && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {step}
                    </span>
                )}
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function CheckoutField({ label, error, required, children }) {
    return (
        <div className="space-y-1.5">
            <label className={fieldLabelClass}>
                {label}
                {required && <span className="text-primary"> *</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function Checkout({
    checkoutCart,
    paymentMethods = [],
    user,
    addresses = [],
    rewards = {},
    divisions = [],
}) {
    const cart = checkoutCart ?? { items: [], totals: defaultTotals, coupon: null };
    const items = Array.isArray(cart.items) ? cart.items : [];
    const initialTotals = cart.totals ?? defaultTotals;
    const methods = Array.isArray(paymentMethods) ? paymentMethods : Object.values(paymentMethods ?? {});
    const defaultPaymentMethod = methods[0]?.value ?? 'cod';

    const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];

    const [cartState, setCartState] = useState(cart);
    const [totals, setTotals] = useState(initialTotals);
    const [shippingZone, setShippingZone] = useState(initialTotals.shipping_zone ?? null);

    const { data, setData, post, processing, errors } = useForm({
        name: defaultAddr?.name || user?.name || '',
        phone: defaultAddr?.phone || user?.phone || '',
        email: defaultAddr?.email || user?.email || '',
        ...emptyAddress,
        division: defaultAddr?.division || '',
        district: defaultAddr?.district || '',
        thana: defaultAddr?.thana || '',
        local_address: defaultAddr?.local_address || '',
        postal_code: defaultAddr?.postal_code || '',
        customer_note: '',
        payment_method: defaultPaymentMethod,
        loyalty_points: 0,
        wallet_amount: 0,
        use_max_loyalty: false,
        use_max_wallet: false,
    });

    useEffect(() => {
        setCartState(cart);
        setTotals(cart.totals ?? defaultTotals);
        setShippingZone(cart.totals?.shipping_zone ?? null);
    }, [checkoutCart]);

    useEffect(() => {
        if (!data.district) return;

        axios.post('/shop/checkout/shipping-preview', { district: data.district })
            .then((res) => {
                setTotals((prev) => ({
                    ...prev,
                    shipping: res.data.shipping,
                    tax: res.data.tax ?? prev.tax,
                    tax_label: res.data.tax_label ?? prev.tax_label,
                    total: res.data.total,
                }));
                setShippingZone(res.data.shipping_zone);
            })
            .catch(() => {});
    }, [data.district]);

    const fillAddress = (addr) => {
        setData({
            ...data,
            name: addr.name,
            phone: addr.phone,
            email: addr.email || data.email,
            division: addr.division || '',
            district: addr.district || '',
            thana: addr.thana || '',
            local_address: addr.local_address || '',
            postal_code: addr.postal_code || '',
        });
    };

    const handleCartUpdate = (updatedCart) => {
        if (!updatedCart) return;
        setCartState(updatedCart);
        setTotals(updatedCart.totals ?? defaultTotals);
        setShippingZone(updatedCart.totals?.shipping_zone ?? null);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/shop/checkout');
    };

    const couponDiscount = totals.coupon_discount ?? 0;
    const campaignDiscount = totals.campaign_discount ?? 0;
    const minRedeem = rewards.min_redeem ?? rewards.min_redeem_points ?? 0;

    return (
        <ShopLayout>
            <div className="mb-8 flex items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Checkout
                </h1>
                <Link
                    href="/shop/cart"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Cart
                </Link>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <CheckoutSection step={1} title="Delivery Details">
                        {addresses.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
                                {addresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        type="button"
                                        onClick={() => fillAddress(addr)}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:border-primary hover:bg-primary/5 dark:border-slate-600 dark:hover:bg-primary/10"
                                    >
                                        {addr.label} — {addr.district}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CheckoutField label="Full Name" error={errors.name} required>
                                    <input
                                        className={clsx('input-premium', errors.name && 'border-red-400')}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Karim Rahman"
                                        required
                                    />
                                </CheckoutField>
                                <CheckoutField label="Phone Number" error={errors.phone} required>
                                    <input
                                        className={clsx('input-premium', errors.phone && 'border-red-400')}
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="01XXXXXXXXX"
                                        required
                                    />
                                </CheckoutField>
                            </div>

                            <BangladeshAddressFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                divisions={divisions}
                                layout="checkout"
                            />
                        </div>
                    </CheckoutSection>

                    {user && (rewards.loyalty_enabled || rewards.wallet_enabled) && (
                        <CheckoutSection title="Rewards">
                            <div className="space-y-4">
                                {rewards.loyalty_enabled && (rewards.points_balance ?? 0) >= minRedeem && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            You have <strong>{rewards.points_balance}</strong> points
                                            (up to {formatPrice(rewards.max_loyalty_discount)} off)
                                        </p>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={data.use_max_loyalty}
                                                onChange={(e) => setData('use_max_loyalty', e.target.checked)}
                                                className="rounded"
                                            />
                                            Use maximum points
                                        </label>
                                        {!data.use_max_loyalty && (
                                            <Input
                                                label="Points to use"
                                                type="number"
                                                min="0"
                                                max={rewards.points_balance}
                                                value={data.loyalty_points}
                                                onChange={(e) => setData('loyalty_points', e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}
                                {rewards.wallet_enabled && (rewards.wallet_balance ?? 0) > 0 && (
                                    <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Wallet balance: <strong>{formatPrice(rewards.wallet_balance)}</strong>
                                        </p>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={data.use_max_wallet}
                                                onChange={(e) => setData('use_max_wallet', e.target.checked)}
                                                className="rounded"
                                            />
                                            Use full wallet balance
                                        </label>
                                        {!data.use_max_wallet && (
                                            <Input
                                                label="Wallet amount (৳)"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                max={rewards.wallet_balance}
                                                value={data.wallet_amount}
                                                onChange={(e) => setData('wallet_amount', e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </CheckoutSection>
                    )}

                    <CheckoutSection step={2} title="Payment Method">
                        <CheckoutPaymentPicker
                            methods={methods}
                            value={data.payment_method}
                            onChange={(value) => setData('payment_method', value)}
                            error={errors.payment_method}
                        />
                    </CheckoutSection>
                </div>

                <div className="lg:col-span-2">
                    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white">Your Order</h3>
                            <Link href="/shop/cart" className="text-xs font-medium text-primary hover:opacity-80">
                                Edit
                            </Link>
                        </div>

                        <div className="space-y-4 px-5 py-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                                        <ProductThumbnail product={{ name: item.name, image: item.image }} size="sm" />
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">
                                            {item.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {formatPrice(item.unit_price)} each
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-bold text-slate-900 dark:text-white">
                                        {formatPrice(item.line_total)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-700">
                            <div className="mb-3 flex items-center gap-1.5">
                                <Tag size={14} className="text-primary" />
                                <span className={fieldLabelClass}>Have a promo code?</span>
                            </div>
                            <PromoCodeForm
                                cart={cartState}
                                variant="inline"
                                district={data.district || null}
                                onCartUpdate={handleCartUpdate}
                            />
                        </div>

                        <div className="space-y-2.5 border-t border-slate-100 px-5 py-4 text-sm dark:border-slate-700">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span className="font-medium text-slate-900 dark:text-white">{formatPrice(totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Delivery{shippingZone?.name ? ` (${shippingZone.name})` : ''}</span>
                                <span className={totals.shipping === 0 ? 'font-semibold text-emerald-600' : 'font-medium text-slate-900 dark:text-white'}>
                                    {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
                                </span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Coupon{cartState.coupon?.code ? ` (${cartState.coupon.code})` : ''}</span>
                                    <span className="font-semibold text-primary">- {formatPrice(couponDiscount)}</span>
                                </div>
                            )}
                            {campaignDiscount > 0 && (
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Promotion</span>
                                    <span className="font-semibold text-primary">- {formatPrice(campaignDiscount)}</span>
                                </div>
                            )}
                            {couponDiscount === 0 && campaignDiscount === 0 && (
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Discount</span>
                                    <span className="font-medium text-slate-900 dark:text-white">- {formatPrice(0)}</span>
                                </div>
                            )}
                            {totals.tax > 0 && (
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>{totals.tax_label || 'Tax'}</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatPrice(totals.tax)}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-700">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total</p>
                                    <p className="text-xs text-slate-400">Incl. all taxes</p>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(totals.total)}
                                </p>
                            </div>
                            <Button
                                type="submit"
                                loading={processing}
                                size="lg"
                                className="mt-4 w-full text-base font-bold"
                            >
                                Place Order
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </ShopLayout>
    );
}
