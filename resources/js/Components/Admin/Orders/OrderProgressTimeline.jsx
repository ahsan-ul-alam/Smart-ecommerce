import { useState } from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import { formatDateTime } from './orderUtils';

const TERMINAL_STYLES = {
    cancelled: { bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-500' },
    returned: { bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40', text: 'text-amber-800 dark:text-amber-400', badge: 'bg-amber-500' },
    refunded: { bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300', badge: 'bg-slate-500' },
};

export default function OrderProgressTimeline({ workflowSteps = [], currentStatus, statusLabel, statusHistories = [] }) {
    const [activeStep, setActiveStep] = useState(null);
    const terminalStyle = TERMINAL_STYLES[currentStatus];
    const currentIndex = workflowSteps.findIndex((s) => s.value === currentStatus);

    const timestampByStatus = statusHistories.reduce((acc, h) => {
        if (!acc[h.status]) acc[h.status] = h.created_at;
        return acc;
    }, {});

    if (terminalStyle || currentIndex === -1) {
        return (
            <div className={clsx('admin-card px-5 py-4 flex items-center gap-3', terminalStyle?.bg ?? 'bg-slate-50 dark:bg-slate-800 border-slate-200')}>
                <span className={clsx('flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white', terminalStyle?.badge ?? 'bg-slate-500')}>!</span>
                <div>
                    <p className={clsx('text-sm font-bold', terminalStyle?.text ?? 'text-slate-700 dark:text-slate-200')}>{statusLabel}</p>
                    <p className="text-xs text-slate-500">Outside standard fulfillment flow</p>
                </div>
            </div>
        );
    }

    const progressPercent = workflowSteps.length > 1
        ? (currentIndex / (workflowSteps.length - 1)) * 100
        : 0;

    return (
        <div className="admin-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fulfillment Progress</h2>
                <span className="text-xs text-slate-400">{Math.round(progressPercent)}% complete</span>
            </div>

            <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-600 rounded-full hidden sm:block" />
                <div
                    className="absolute top-4 left-4 h-0.5 bg-primary rounded-full hidden sm:block transition-all duration-700 ease-out"
                    style={{ width: `calc(${progressPercent}% - 2rem)` }}
                />

                <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1 scrollbar-thin">
                    {workflowSteps.map((step, index) => {
                        const done = index < currentIndex;
                        const active = index === currentIndex;
                        const upcoming = index > currentIndex;
                        const timestamp = timestampByStatus[step.value];
                        const isOpen = activeStep === step.value;

                        return (
                            <button
                                key={step.value}
                                type="button"
                                onClick={() => setActiveStep(isOpen ? null : step.value)}
                                className="flex flex-col items-center gap-2 min-w-[4.5rem] sm:min-w-0 sm:flex-1 relative z-10 group"
                            >
                                <span
                                    className={clsx(
                                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                                        done && 'bg-primary text-white shadow-sm',
                                        active && 'bg-primary text-white ring-4 ring-primary/20 scale-110',
                                        upcoming && 'bg-slate-100 dark:bg-slate-700 text-slate-400',
                                    )}
                                >
                                    {done ? <Check size={14} strokeWidth={3} /> : index + 1}
                                </span>
                                <span
                                    className={clsx(
                                        'text-[10px] sm:text-xs font-semibold text-center leading-tight transition-colors',
                                        active ? 'text-primary' : done ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400',
                                    )}
                                >
                                    {step.label}
                                </span>
                                {(timestamp || isOpen) && (
                                    <span className={clsx(
                                        'text-[10px] text-slate-400 text-center max-w-[5rem] leading-tight',
                                        !isOpen && 'hidden group-hover:block sm:group-hover:block',
                                        isOpen && 'block',
                                    )}>
                                        {timestamp ? formatDateTime(timestamp) : 'Pending'}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
