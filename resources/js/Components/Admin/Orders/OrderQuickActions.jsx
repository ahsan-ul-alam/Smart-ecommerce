import { router } from '@inertiajs/react';
import {
    ArrowRight, Truck, FileText, MessageSquare, Mail, Banknote, RotateCcw,
    ChevronDown, XCircle, Settings2,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import Select from '../../UI/Select';
import Textarea from '../../UI/Textarea';
import Button from '../../UI/Button';
import { useForm } from '@inertiajs/react';

function StatusButton({ orderId, status, label, variant = 'secondary', icon: Icon, onClick }) {
    const handle = () => {
        router.patch(`/admin/orders/${orderId}/status`, { status }, { preserveScroll: true });
        onClick?.();
    };

    return (
        <button
            type="button"
            onClick={handle}
            className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-premium text-left',
                variant === 'primary' && 'bg-primary text-white hover:opacity-90',
                variant === 'danger' && 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400',
                variant === 'secondary' && 'border border-slate-200/80 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:bg-primary/5',
            )}
        >
            {Icon && <Icon size={16} className="shrink-0" />}
            <span className="flex-1">{label}</span>
        </button>
    );
}

export default function OrderQuickActions({
    order,
    defaultNext,
    nextStatuses = [],
    statuses = [],
    onAction,
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const statusForm = useForm({ status: order.status, note: '', force: false });
    const alternateStatuses = nextStatuses.filter((s) => s.value !== defaultNext?.value);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const actions = [
        defaultNext && {
            key: 'advance',
            label: `Mark as ${defaultNext.label}`,
            icon: ArrowRight,
            variant: 'primary',
            onClick: () => router.post(`/admin/orders/${order.id}/advance`, {}, { preserveScroll: true }),
        },
        { key: 'status', label: 'Update Status', icon: Settings2, onClick: () => setShowAdvanced((v) => !v) },
        { key: 'courier', label: 'Assign Courier', icon: Truck, onClick: () => scrollTo('shipment-card') },
        order.source !== 'pos' && {
            key: 'invoice',
            label: 'Generate Invoice',
            icon: FileText,
            onClick: () => window.open(`/admin/orders/${order.id}/invoice`, '_blank'),
        },
        order.customer_phone && {
            key: 'sms',
            label: 'Send SMS',
            icon: MessageSquare,
            onClick: () => onAction?.('sms'),
        },
        order.customer_email && {
            key: 'email',
            label: 'Send Email',
            icon: Mail,
            onClick: () => window.open(`mailto:${order.customer_email}?subject=Order ${order.order_number}`, '_blank'),
        },
        order.refundable_remaining > 0 && {
            key: 'refund',
            label: 'Refund Order',
            icon: Banknote,
            onClick: () => onAction?.('refund'),
        },
    ].filter(Boolean);

    return (
        <div className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
                {actions.map((action) => (
                    <button
                        key={action.key}
                        type="button"
                        onClick={action.onClick}
                        className={clsx(
                            'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-premium text-left',
                            action.variant === 'primary'
                                ? 'bg-primary text-white hover:opacity-90 shadow-sm'
                                : 'border border-slate-200/80 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:bg-primary/5',
                        )}
                    >
                        <action.icon size={16} className="shrink-0" />
                        <span className="flex-1">{action.label}</span>
                        {action.variant === 'primary' && <ArrowRight size={14} />}
                    </button>
                ))}

                {alternateStatuses.map((s) => (
                    <StatusButton
                        key={s.value}
                        orderId={order.id}
                        status={s.value}
                        label={s.label}
                        variant={s.value === 'cancelled' || s.value === 'returned' ? 'danger' : 'secondary'}
                        icon={s.value === 'cancelled' ? XCircle : s.value === 'returned' ? RotateCcw : null}
                    />
                ))}

                <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 hover:text-primary transition-premium"
                >
                    Advanced override
                    <ChevronDown size={14} className={clsx('transition-transform', showAdvanced && 'rotate-180')} />
                </button>

                {showAdvanced && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            statusForm.patch(`/admin/orders/${order.id}/status`, { preserveScroll: true });
                        }}
                        className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/80"
                    >
                        <Select
                            label="Status"
                            value={statusForm.data.status}
                            onChange={(e) => statusForm.setData('status', e.target.value)}
                            options={statuses.map((s) => ({ value: s.value, label: s.label }))}
                        />
                        <Textarea
                            label="Note"
                            value={statusForm.data.note}
                            onChange={(e) => statusForm.setData('note', e.target.value)}
                            rows={2}
                        />
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                            <input
                                type="checkbox"
                                checked={statusForm.data.force}
                                onChange={(e) => statusForm.setData('force', e.target.checked)}
                                className="rounded"
                            />
                            Force change
                        </label>
                        <Button type="submit" variant="secondary" loading={statusForm.processing} className="w-full">
                            Apply
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
