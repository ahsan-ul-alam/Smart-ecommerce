import clsx from 'clsx';

export default function Textarea({ label, error, className, rows = 4, ...props }) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            )}
            <textarea
                rows={rows}
                className={clsx('input-premium resize-y', error && 'border-red-400', className)}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
