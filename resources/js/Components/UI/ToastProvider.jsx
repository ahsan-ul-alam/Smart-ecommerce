import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext({
    showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

function ToastBubble({ toast, onDismiss }) {
    if (!toast) return null;

    return (
        <div
            className={clsx(
                'fixed bottom-4 right-4 z-[200] flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium max-w-sm',
                'border backdrop-blur-md transition-all duration-200',
                toast.type === 'success' && 'bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100',
                toast.type === 'error' && 'bg-red-50/95 border-red-200 text-red-900 dark:bg-red-950/90 dark:border-red-800 dark:text-red-100',
                toast.type === 'info' && 'bg-white/95 border-slate-200 text-slate-800 dark:bg-slate-800/95 dark:border-slate-600 dark:text-slate-100',
            )}
            role="status"
        >
            {toast.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 p-0.5 rounded-lg opacity-60 hover:opacity-100"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export default function ToastProvider({ children }) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        if (!message) return;
        setToast({ message, type, id: Date.now() });
    }, []);

    const dismiss = useCallback(() => setToast(null), []);

    useEffect(() => {
        if (!toast) return undefined;
        const duration = toast.type === 'error' ? 6000 : 4500;
        const timer = setTimeout(() => setToast(null), duration);
        return () => clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        const message = flash?.success || flash?.error || flash?.info;
        if (!message) return;
        showToast(message, flash?.success ? 'success' : flash?.info ? 'info' : 'error');
    }, [flash?.success, flash?.error, flash?.info, showToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastBubble toast={toast} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}
