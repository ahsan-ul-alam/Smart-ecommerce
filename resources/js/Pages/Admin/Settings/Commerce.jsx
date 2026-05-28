import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function Commerce({ settings }) {
    const { data, setData, put, processing } = useForm({
        settings: {
            shipping_charge: settings.shipping_charge ?? 80,
            free_shipping_min: settings.free_shipping_min ?? 2000,
            loyalty_points_per_100: settings.loyalty_points_per_100 ?? 10,
            loyalty_point_value: settings.loyalty_point_value ?? 1,
            loyalty_min_redeem: settings.loyalty_min_redeem ?? 100,
            referral_reward_amount: settings.referral_reward_amount ?? 50,
            referral_reward_type: settings.referral_reward_type ?? 'wallet',
            affiliate_commission_rate: settings.affiliate_commission_rate ?? 5,
            tax_enabled: !!settings.tax_enabled,
            tax_rate: settings.tax_rate ?? 0,
            tax_label: settings.tax_label ?? 'VAT',
        },
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/settings/commerce');
    };

    return (
        <AdminLayout title="Commerce Settings">
            <FlashMessage />
            <Card className="max-w-2xl">
                <CardHeader title="Shipping & Rewards" />
                <CardBody>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <h4 className="font-medium mb-3">Shipping</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Shipping Charge (৳)" type="number" min="0" value={data.settings.shipping_charge}
                                    onChange={(e) => setData('settings', { ...data.settings, shipping_charge: e.target.value })} />
                                <Input label="Free Shipping Min (৳)" type="number" min="0" value={data.settings.free_shipping_min}
                                    onChange={(e) => setData('settings', { ...data.settings, free_shipping_min: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-3">Loyalty Points</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input label="Points per ৳100 spent" type="number" min="0" value={data.settings.loyalty_points_per_100}
                                    onChange={(e) => setData('settings', { ...data.settings, loyalty_points_per_100: e.target.value })} />
                                <Input label="1 point = ৳" type="number" min="0" step="0.01" value={data.settings.loyalty_point_value}
                                    onChange={(e) => setData('settings', { ...data.settings, loyalty_point_value: e.target.value })} />
                                <Input label="Min points to redeem" type="number" min="0" value={data.settings.loyalty_min_redeem}
                                    onChange={(e) => setData('settings', { ...data.settings, loyalty_min_redeem: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-3">Referral Program</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Reward amount (৳ or pts)" type="number" min="0" value={data.settings.referral_reward_amount}
                                    onChange={(e) => setData('settings', { ...data.settings, referral_reward_amount: e.target.value })} />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reward type</label>
                                    <select
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                                        value={data.settings.referral_reward_type}
                                        onChange={(e) => setData('settings', { ...data.settings, referral_reward_type: e.target.value })}
                                    >
                                        <option value="wallet">Wallet credit</option>
                                        <option value="loyalty">Loyalty points</option>
                                    </select>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Reward referrer when referred customer completes their first paid order.</p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-3">Tax / VAT</h4>
                            <label className="flex items-center gap-2 mb-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={!!data.settings.tax_enabled}
                                    onChange={(e) => setData('settings', { ...data.settings, tax_enabled: e.target.checked })}
                                    className="rounded"
                                />
                                Enable tax on product subtotal (after discounts)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Tax rate (%)"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.settings.tax_rate}
                                    onChange={(e) => setData('settings', { ...data.settings, tax_rate: e.target.value })}
                                />
                                <Input
                                    label="Label on receipts"
                                    value={data.settings.tax_label}
                                    onChange={(e) => setData('settings', { ...data.settings, tax_label: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-3">Affiliate Program</h4>
                            <Input label="Commission rate (%)" type="number" min="0" max="100" step="0.5"
                                value={data.settings.affiliate_commission_rate}
                                onChange={(e) => setData('settings', { ...data.settings, affiliate_commission_rate: e.target.value })} />
                            <p className="text-xs text-slate-500 mt-2">Affiliates earn this % when customers purchase via ?aff=CODE links.</p>
                        </div>
                        <Button type="submit" loading={processing}>Save Settings</Button>
                    </form>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
