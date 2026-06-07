import clsx from 'clsx';
import { Check } from 'lucide-react';

const TERMINAL_STYLES = {
    cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
    returned: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', badge: 'bg-amber-500' },
    refunded: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', badge: 'bg-slate-500' },
};

export default function OrderStatusStepper({ workflowSteps = [], currentStatus, statusLabel }) {
    const terminalStyle = TERMINAL_STYLES[currentStatus];
    const currentIndex = workflowSteps.findIndex((s) => s.value === currentStatus);

    if (terminalStyle || currentIndex === -1) {
        return (
            <div className={clsx('rounded-2xl border px-5 py-4 flex items-center gap-3', terminalStyle?.bg ?? 'bg-slate-50 border-slate-200')}>
                <span className={clsx('flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white', terminalStyle?.badge ?? 'bg-slate-500')}>
                    !
                </span>
                <div>
                    <p className={clsx('text-sm font-bold', terminalStyle?.text ?? 'text-slate-700')}>
                        {statusLabel}
                    </p>
                    <p className="text-xs text-slate-500">This order is outside the standard fulfillment flow.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                {workflowSteps.map((step, index) => {
                    const done = index < currentIndex;
                    const active = index === currentIndex;
                    const upcoming = index > currentIndex;

                    return (
                        <div key={step.value} className="flex items-center flex-1 min-w-[4.5rem] last:flex-none">
                            <div className="flex flex-col items-center gap-1.5 w-full">
                                <span
                                    className={clsx(
                                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                                        done && 'bg-indigo-600 text-white',
                                        active && 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/40',
                                        upcoming && 'bg-slate-100 text-slate-400 dark:bg-slate-700',
                                    )}
                                >
                                    {done ? <Check size={14} strokeWidth={3} /> : index + 1}
                                </span>
                                <span
                                    className={clsx(
                                        'text-[10px] sm:text-xs font-semibold text-center leading-tight',
                                        active ? 'text-indigo-700 dark:text-indigo-300' : done ? 'text-slate-600' : 'text-slate-400',
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < workflowSteps.length - 1 && (
                                <div
                                    className={clsx(
                                        'h-0.5 flex-1 mx-1 sm:mx-2 rounded-full min-w-[1rem]',
                                        index < currentIndex ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600',
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
