import clsx from 'clsx';

const variants = {
    success: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-700 ring-1 ring-red-500/20 dark:text-red-400',
    info: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-400',
    default: 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/15 dark:text-slate-300',
};

export default function Badge({ children, variant = 'default', className }) {
    return (
        <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
            {children}
        </span>
    );
}
