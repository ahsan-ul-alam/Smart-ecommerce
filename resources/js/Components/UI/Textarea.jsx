import clsx from 'clsx';

export default function Textarea({ label, error, className, rows = 4, ...props }) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            )}
            <textarea
                rows={rows}
                className={clsx(
                    'w-full px-3 py-2.5 rounded-lg border text-sm resize-y',
                    'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
                    'border-slate-300 dark:border-slate-600',
                    'focus:outline-none focus:ring-2 focus:ring-teal-500',
                    error && 'border-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
