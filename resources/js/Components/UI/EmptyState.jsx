import clsx from 'clsx';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
    return (
        <div className={clsx('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
            {Icon && (
                <div className="mb-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-400">
                    <Icon size={32} strokeWidth={1.5} />
                </div>
            )}
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h3>
            {description && <p className="text-sm text-slate-500 mt-2 max-w-sm">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
