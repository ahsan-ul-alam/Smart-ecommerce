import clsx from 'clsx';

export default function Select({ label, error, options = [], className, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <select
                className={clsx('input-premium', error && 'border-red-400', className)}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
