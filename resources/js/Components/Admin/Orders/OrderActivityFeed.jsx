import clsx from 'clsx';
import {
    Clock, CheckCircle2, Cog, Package, Truck, CheckCheck, XCircle, RotateCcw, Banknote,
} from 'lucide-react';
import { formatDateTime, statusColors } from './orderUtils';

const ICON_MAP = {
    pending: Clock,
    confirmed: CheckCircle2,
    processing: Cog,
    packed: Package,
    shipped: Truck,
    delivered: CheckCheck,
    cancelled: XCircle,
    returned: RotateCcw,
    refunded: Banknote,
};

export default function OrderActivityFeed({ statusHistories = [] }) {
    const entries = [...statusHistories].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    return (
        <div className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Activity Feed</h2>
            </div>
            <div className="p-5 sm:p-6">
                {entries.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No activity recorded yet.</p>
                ) : (
                    <div className="relative">
                        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-600" />
                        <ul className="space-y-5">
                            {entries.map((entry, i) => {
                                const Icon = ICON_MAP[entry.status] ?? Clock;
                                const color = statusColors[entry.status] ?? 'text-slate-600 bg-slate-500/10';

                                return (
                                    <li key={i} className="relative flex gap-4 pl-0">
                                        <span className={clsx('relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', color)}>
                                            <Icon size={14} />
                                        </span>
                                        <div className="min-w-0 flex-1 pt-0.5">
                                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {entry.status_label}
                                                </p>
                                                <time className="text-xs text-slate-400">{formatDateTime(entry.created_at)}</time>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {entry.user_name ?? 'System'}
                                                {entry.note ? '' : ' updated order status'}
                                            </p>
                                            {entry.note && (
                                                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
                                                    {entry.note}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
