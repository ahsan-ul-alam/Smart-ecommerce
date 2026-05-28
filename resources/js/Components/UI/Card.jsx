import clsx from 'clsx';

export function Card({ children, className }) {
    return (
        <div className={clsx('bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm', className)}>
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function CardBody({ children, className }) {
    return <div className={clsx('p-6', className)}>{children}</div>;
}
