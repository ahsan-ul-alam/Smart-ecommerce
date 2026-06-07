import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Tag, X } from 'lucide-react';
import clsx from 'clsx';
import Button from '../UI/Button';
import { useToast } from '../UI/ToastProvider';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function PromoCodeForm({
    cart,
    onCartUpdate,
    district = null,
    variant = 'sidebar',
    className = '',
}) {
    const { modules = [] } = usePage().props;
    const { showToast } = useToast();
    const couponEnabled = modules.includes('coupon');

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!couponEnabled) {
        return null;
    }

    const payload = () => ({
        code: code.trim().toUpperCase(),
        ...(district ? { district } : {}),
    });

    const apply = async (e) => {
        e.preventDefault();
        const trimmed = code.trim();

        if (!trimmed) {
            const msg = 'Please enter a coupon code.';
            setError(msg);
            showToast(msg, 'error');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('/shop/cart/coupon', payload(), {
                headers: { Accept: 'application/json' },
            });

            setCode('');
            onCartUpdate?.(data.cart);
            showToast(data.message, 'success');
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.errors?.code?.[0]
                || 'Could not apply coupon. Please try again.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const remove = async () => {
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.delete('/shop/cart/coupon', {
                headers: { Accept: 'application/json' },
                data: district ? { district } : {},
            });

            onCartUpdate?.(data.cart);
            showToast(data.message, 'success');
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not remove coupon.';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const couponDiscount = cart?.totals?.coupon_discount ?? 0;
    const isCompact = variant === 'inline';

    if (cart?.coupon) {
        return (
            <div className={clsx('rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30', className)}>
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                            <Tag size={14} className="shrink-0" />
                            <span className="font-mono truncate">{cart.coupon.code}</span>
                        </p>
                        {couponDiscount > 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                Saving {formatPrice(couponDiscount)}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={remove}
                        disabled={loading}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                    >
                        <X size={12} />
                        Remove
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={apply} className={className}>
            <div className={clsx('flex gap-2', isCompact ? 'flex-col sm:flex-row' : '')}>
                <div className="flex-1">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            if (error) setError('');
                        }}
                        placeholder="Enter voucher code"
                        className={clsx(
                            'input-premium w-full uppercase text-sm',
                            error && 'border-red-400 focus:ring-red-200',
                        )}
                        maxLength={50}
                        autoComplete="off"
                        disabled={loading}
                    />
                    {error && (
                        <p className="mt-1.5 text-xs text-red-500">{error}</p>
                    )}
                </div>
                <Button
                    type="submit"
                    variant={isCompact ? 'primary' : 'secondary'}
                    loading={loading}
                    className={clsx('shrink-0', isCompact && 'sm:self-start')}
                >
                    Apply
                </Button>
            </div>
        </form>
    );
}
