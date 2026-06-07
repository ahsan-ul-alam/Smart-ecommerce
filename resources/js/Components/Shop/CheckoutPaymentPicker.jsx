import clsx from 'clsx';

const PAYMENT_META = {
    cod: { name: 'Cash on Delivery', short: 'COD', bg: 'bg-emerald-500', popular: true },
    bkash: { name: 'bKash', short: 'bK', bg: 'bg-pink-500' },
    nagad: { name: 'Nagad', short: 'N', bg: 'bg-orange-500' },
    sslcommerz: { name: 'SSLCommerz', short: 'SSL', bg: 'bg-slate-700' },
    aamarpay: { name: 'AmarPay', short: 'AP', bg: 'bg-indigo-600' },
    stripe: { name: 'Stripe', short: 'S', bg: 'bg-violet-600' },
    paypal: { name: 'PayPal', short: 'PP', bg: 'bg-blue-600' },
};

function PaymentLogo({ method }) {
    const meta = PAYMENT_META[method] ?? { short: '?', bg: 'bg-slate-400', name: method };

    return (
        <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white', meta.bg)}>
            {meta.short}
        </span>
    );
}

export default function CheckoutPaymentPicker({ methods = [], value, onChange, error }) {
    const paymentMethods = Array.isArray(methods) ? methods : Object.values(methods ?? {});

    if (paymentMethods.length === 0) {
        return (
            <p className="text-sm text-red-600 dark:text-red-400">
                No payment methods are available. Please contact the store.
            </p>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                    const meta = PAYMENT_META[method.value] ?? { name: method.label, bg: 'bg-slate-400' };
                    const selected = value === method.value;

                    return (
                        <button
                            key={method.value}
                            type="button"
                            onClick={() => onChange(method.value)}
                            className={clsx(
                                'relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all',
                                selected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-primary/40 dark:border-slate-600 dark:bg-slate-800',
                            )}
                        >
                            <PaymentLogo method={method.value} />
                            <div className="min-w-0 flex-1">
                                <p className={clsx('text-sm font-semibold leading-tight', selected ? 'text-primary' : 'text-slate-800 dark:text-slate-100')}>
                                    {meta.name}
                                </p>
                                {meta.popular && (
                                    <span className="mt-1 inline-block rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                        Popular
                                    </span>
                                )}
                            </div>
                            <span
                                className={clsx(
                                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                                    selected ? 'border-primary bg-primary' : 'border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-700',
                                )}
                            >
                                {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                        </button>
                    );
                })}
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
}
