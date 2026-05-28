import { Link } from '@inertiajs/react';
import clsx from 'clsx';
import { Bell, Inbox, MessageSquare, Package, RotateCcw, Star, Truck } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';

const icons = {
    orders: Inbox,
    returns: RotateCcw,
    reviews: Star,
    contact: MessageSquare,
    inventory: Package,
    delivery: Truck,
};

const priorityStyles = {
    high: 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10',
    medium: 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/10',
    low: 'border-slate-200 dark:border-slate-700',
};

export default function AlertsIndex({ alerts = [], total = 0 }) {
    return (
        <AdminLayout title="Alerts">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Bell size={24} className="text-indigo-500" />
                    Admin alerts
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                    {total > 0
                        ? `${total} item(s) need your attention across the store.`
                        : 'You are all caught up — no pending alerts.'}
                </p>
            </div>

            {alerts.length > 0 ? (
                <ul className="space-y-3">
                    {alerts.map((alert) => {
                        const Icon = icons[alert.type] ?? Bell;
                        return (
                            <li key={alert.id}>
                                <Link
                                    href={alert.href}
                                    className={clsx(
                                        'admin-card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-premium border',
                                        priorityStyles[alert.priority] || priorityStyles.low
                                    )}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Icon size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
                                            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                                                {alert.count}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{alert.description}</p>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="admin-card p-16 text-center">
                    <Bell size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No alerts right now.</p>
                </div>
            )}
        </AdminLayout>
    );
}
