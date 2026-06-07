import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState('');

    const message = flash?.success || flash?.error || flash?.info;
    const type = flash?.success ? 'success' : flash?.info ? 'info' : 'error';

    useEffect(() => {
        if (message && message !== dismissed) {
            setVisible(true);
            const duration = type === 'error' ? 6000 : 4500;
            const timer = setTimeout(() => setVisible(false), duration);
            return () => clearTimeout(timer);
        }

        if (!message) {
            setVisible(false);
        }
    }, [message, type, dismissed]);

    if (!visible || !message) return null;

    return (
        <div
            className={clsx(
                'fixed bottom-4 right-4 z-[100] flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium max-w-sm',
                'border backdrop-blur-md transition-all duration-200',
                type === 'success' && 'bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100',
                type === 'error' && 'bg-red-50/95 border-red-200 text-red-900 dark:bg-red-950/90 dark:border-red-800 dark:text-red-100',
                type === 'info' && 'bg-white/95 border-slate-200 text-slate-800 dark:bg-slate-800/95 dark:border-slate-600 dark:text-slate-100',
            )}
            role="status"
        >
            {type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <p className="flex-1 leading-snug">{message}</p>
            <button
                type="button"
                onClick={() => {
                    setDismissed(message);
                    setVisible(false);
                }}
                className="shrink-0 p-0.5 rounded-lg opacity-60 hover:opacity-100"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
}
