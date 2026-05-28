import AccountLayout from '../../Layouts/AccountLayout';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function Rewards({
    referral_enabled, referral_code, referral_link, referral_reward, referrals_made = [],
    affiliate_enabled, is_affiliate, affiliate_code, affiliate_link, affiliate_commission_rate,
    affiliate_earnings = 0, affiliate_commissions = [],
    loyalty_enabled, wallet_enabled, points, point_value, min_redeem,
    points_per_100, wallet_balance, loyalty_history, wallet_history,
}) {
    const copyLink = () => {
        if (referral_link) navigator.clipboard?.writeText(referral_link);
    };
    return (
        <AccountLayout title="Points & Wallet">
            {referral_enabled && (
                <Card className="mb-6">
                    <CardHeader title="Refer a Friend" subtitle={`Earn ৳${referral_reward} when they complete their first order`} />
                    <CardBody className="space-y-3">
                        <p className="text-sm">Your code: <span className="font-mono font-bold text-teal-700">{referral_code}</span></p>
                        <div className="flex gap-2 flex-wrap">
                            <input readOnly value={referral_link ?? ''} className="flex-1 min-w-[200px] text-sm rounded-lg border border-slate-300 px-3 py-2" />
                            <button type="button" onClick={copyLink} className="text-sm px-4 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800">Copy link</button>
                        </div>
                        {referrals_made.length > 0 && (
                            <ul className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                                {referrals_made.map((r) => (
                                    <li key={r.id} className="py-2 flex justify-between">
                                        <span>{r.referred_name}</span>
                                        <span className={r.status === 'rewarded' ? 'text-green-600' : 'text-slate-400'}>{r.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardBody>
                </Card>
            )}

            {affiliate_enabled && is_affiliate && (
                <Card className="mb-6">
                    <CardHeader title="Affiliate Earnings" subtitle={`${affiliate_commission_rate}% commission on referred orders`} />
                    <CardBody className="space-y-3">
                        <p className="text-sm">Total earned: <strong>৳{Number(affiliate_earnings).toLocaleString('en-BD')}</strong></p>
                        <p className="text-sm">Your link: <code className="text-xs bg-slate-100 px-1 rounded">{affiliate_link}</code></p>
                        <button type="button" onClick={() => navigator.clipboard?.writeText(affiliate_link)} className="text-sm text-teal-700 hover:underline">Copy affiliate link</button>
                        {affiliate_commissions.length > 0 && (
                            <ul className="text-sm divide-y divide-slate-100">
                                {affiliate_commissions.map((c) => (
                                    <li key={c.id} className="py-2 flex justify-between">
                                        <span>{c.order_number}</span>
                                        <span>৳{c.commission_amount} · {c.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardBody>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {loyalty_enabled && (
                    <Card>
                        <CardBody>
                            <p className="text-sm text-slate-500">Loyalty Points</p>
                            <p className="text-3xl font-bold text-teal-700">{points.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Worth ~{formatPrice(points * point_value)} · Min redeem: {min_redeem} pts
                            </p>
                            <p className="text-xs text-slate-400">Earn {points_per_100} pts per ৳100 spent</p>
                        </CardBody>
                    </Card>
                )}
                {wallet_enabled && (
                    <Card>
                        <CardBody>
                            <p className="text-sm text-slate-500">Wallet Balance</p>
                            <p className="text-3xl font-bold text-amber-600">{formatPrice(wallet_balance)}</p>
                            <p className="text-xs text-slate-400 mt-1">Use at checkout on your next order</p>
                        </CardBody>
                    </Card>
                )}
            </div>

            {loyalty_enabled && (
                <Card className="mb-6">
                    <CardHeader title="Points History" />
                    <CardBody className="divide-y divide-slate-100 dark:divide-slate-700 p-0">
                        {loyalty_history.length ? loyalty_history.map((t) => (
                            <div key={t.id} className="px-6 py-3 flex justify-between text-sm">
                                <div>
                                    <p className="font-medium capitalize">{t.type}</p>
                                    <p className="text-xs text-slate-400">{t.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className={t.points > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                        {t.points > 0 ? '+' : ''}{t.points} pts
                                    </p>
                                    <p className="text-xs text-slate-400">Bal: {t.balance_after}</p>
                                </div>
                            </div>
                        )) : <p className="px-6 py-8 text-center text-slate-400 text-sm">No transactions yet</p>}
                    </CardBody>
                </Card>
            )}

            {wallet_enabled && (
                <Card>
                    <CardHeader title="Wallet History" />
                    <CardBody className="divide-y divide-slate-100 dark:divide-slate-700 p-0">
                        {wallet_history.length ? wallet_history.map((t) => (
                            <div key={t.id} className="px-6 py-3 flex justify-between text-sm">
                                <div>
                                    <p className="font-medium capitalize">{t.type}</p>
                                    <p className="text-xs text-slate-400">{t.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className={t.type === 'credit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                        {t.type === 'credit' ? '+' : '-'}{formatPrice(t.amount)}
                                    </p>
                                    <p className="text-xs text-slate-400">Bal: {formatPrice(t.balance_after)}</p>
                                </div>
                            </div>
                        )) : <p className="px-6 py-8 text-center text-slate-400 text-sm">No transactions yet</p>}
                    </CardBody>
                </Card>
            )}
        </AccountLayout>
    );
}
