import clsx from 'clsx';

export default function Input({ label, error, className, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <input className={clsx('input-premium', error && 'border-red-400 focus:ring-red-200', className)} {...props} />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
