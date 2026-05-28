import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const message = flash?.success || flash?.error || flash?.info;
    const type = flash?.success ? 'success' : flash?.info ? 'info' : 'error';

    useEffect(() => {
        if (message) {
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        }
    }, [message]);

    if (!visible || !message) return null;

    return (
        <div
            className={clsx(
                'fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium',
                'glass transition-opacity duration-200',
                type === 'success' && 'text-emerald-900 dark:text-emerald-100',
                type === 'error' && 'text-red-900 dark:text-red-100',
                type === 'info' && 'text-slate-800 dark:text-slate-100'
            )}
            role="status"
        >
            {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-500" />}
            {message}
        </div>
    );
}
