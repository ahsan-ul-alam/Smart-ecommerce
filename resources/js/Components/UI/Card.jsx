import clsx from 'clsx';

export function Card({ children, className, glass = false, interactive = false }) {
    return (
        <div
            className={clsx(
                glass ? 'glass-panel' : 'surface-card',
                interactive && 'surface-card-interactive',
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-700/70">
            <div>
                <h3 className="font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function CardBody({ children, className }) {
    return <div className={clsx('p-6', className)}>{children}</div>;
}
