import { useForm } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import Select from '../../Components/UI/Select';
import Textarea from '../../Components/UI/Textarea';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

const districts = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
    'Gazipur', 'Narayanganj', 'Comilla', 'Bogra', 'Jessore', 'Cox\'s Bazar',
].map((d) => ({ value: d, label: d }));

export default function Checkout({ cart, paymentMethods, user, addresses = [], rewards = {} }) {
    const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];

    const { data, setData, post, processing, errors } = useForm({
        name: defaultAddr?.name || user?.name || '',
        phone: defaultAddr?.phone || user?.phone || '',
        email: defaultAddr?.email || user?.email || '',
        address_line_1: defaultAddr?.address_line_1 || '',
        address_line_2: defaultAddr?.address_line_2 || '',
        city: defaultAddr?.city || '',
        district: defaultAddr?.district || 'Dhaka',
        postal_code: defaultAddr?.postal_code || '',
        customer_note: '',
        payment_method: 'cod',
        loyalty_points: 0,
        wallet_amount: 0,
        use_max_loyalty: false,
        use_max_wallet: false,
    });

    const fillAddress = (addr) => {
        setData({
            ...data,
            name: addr.name,
            phone: addr.phone,
            email: addr.email || data.email,
            address_line_1: addr.address_line_1,
            address_line_2: addr.address_line_2 || '',
            city: addr.city,
            district: addr.district,
            postal_code: addr.postal_code || '',
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/shop/checkout');
    };

    const { totals, items } = cart;

    return (
        <ShopLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Checkout</h1>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader title="Shipping Information" />
                            <CardBody className="space-y-4">
                                {addresses.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => fillAddress(addr)}
                                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                            >
                                                {addr.label} — {addr.city}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input label="Full Name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                                    <Input label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} required />
                                </div>
                                <Input label="Email (optional)" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                                <Input label="Address Line 1" value={data.address_line_1} onChange={(e) => setData('address_line_1', e.target.value)} error={errors.address_line_1} required />
                                <Input label="Address Line 2" value={data.address_line_2} onChange={(e) => setData('address_line_2', e.target.value)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="City / Area" value={data.city} onChange={(e) => setData('city', e.target.value)} error={errors.city} required />
                                    <Select label="District" value={data.district} onChange={(e) => setData('district', e.target.value)} options={districts} error={errors.district} />
                                </div>
                                <Input label="Postal Code" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                                <Textarea label="Order Note" value={data.customer_note} onChange={(e) => setData('customer_note', e.target.value)} rows={2} />
                            </CardBody>
                        </Card>

                        {user && (rewards.loyalty_enabled || rewards.wallet_enabled) && (
                            <Card>
                                <CardHeader title="Rewards" subtitle="Apply points or wallet balance" />
                                <CardBody className="space-y-4">
                                    {rewards.loyalty_enabled && rewards.points_balance >= rewards.min_redeem && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-slate-600">
                                                You have <strong>{rewards.points_balance}</strong> points
                                                (up to {formatPrice(rewards.max_loyalty_discount)} off)
                                            </p>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={data.use_max_loyalty}
                                                    onChange={(e) => setData('use_max_loyalty', e.target.checked)} className="rounded" />
                                                Use maximum points
                                            </label>
                                            {!data.use_max_loyalty && (
                                                <Input label="Points to use" type="number" min="0"
                                                    max={rewards.points_balance} value={data.loyalty_points}
                                                    onChange={(e) => setData('loyalty_points', e.target.value)} />
                                            )}
                                        </div>
                                    )}
                                    {rewards.wallet_enabled && rewards.wallet_balance > 0 && (
                                        <div className="space-y-2 border-t pt-4">
                                            <p className="text-sm text-slate-600">
                                                Wallet balance: <strong>{formatPrice(rewards.wallet_balance)}</strong>
                                            </p>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={data.use_max_wallet}
                                                    onChange={(e) => setData('use_max_wallet', e.target.checked)} className="rounded" />
                                                Use full wallet balance
                                            </label>
                                            {!data.use_max_wallet && (
                                                <Input label="Wallet amount (৳)" type="number" min="0" step="0.01"
                                                    max={rewards.wallet_balance} value={data.wallet_amount}
                                                    onChange={(e) => setData('wallet_amount', e.target.value)} />
                                            )}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        )}

                        <Card>
                            <CardHeader title="Payment Method" />
                            <CardBody className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <label key={method.value} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method.value}
                                            checked={data.payment_method === method.value}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="text-teal-600"
                                        />
                                        <span className="font-medium text-slate-800 dark:text-white">{method.label}</span>
                                        {method.value === 'cod' && <span className="text-xs text-slate-400 ml-auto">Pay on delivery</span>}
                                    </label>
                                ))}
                                {errors.payment_method && <p className="text-xs text-red-500">{errors.payment_method}</p>}
                            </CardBody>
                        </Card>
                    </div>

                    <div>
                        <Card className="sticky top-24">
                            <CardHeader title="Your Order" />
                            <CardBody className="space-y-3 text-sm">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between">
                                        <span className="text-slate-600 truncate mr-2">{item.name} × {item.quantity}</span>
                                        <span className="shrink-0">{formatPrice(item.line_total)}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
                                    {totals.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(totals.discount)}</span></div>}
                                    <div className="flex justify-between"><span>Shipping</span><span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span></div>
                                    <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-teal-700">{formatPrice(totals.total)}</span></div>
                                </div>
                                <Button type="submit" loading={processing} className="w-full mt-4">
                                    Place Order
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </form>
            </div>
        </ShopLayout>
    );
}
