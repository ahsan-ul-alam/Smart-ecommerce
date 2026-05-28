import clsx from 'clsx';

const variants = {
    primary: 'bg-primary hover:bg-teal-800 text-white btn-primary-glow',
    secondary: 'glass text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-slate-800/90',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    ghost: 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-5 py-3 text-sm rounded-xl',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className,
    loading,
    children,
    ...props
}) {
    return (
        <button
            className={clsx(
                'inline-flex items-center justify-center gap-2 font-medium transition-premium',
                'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}
