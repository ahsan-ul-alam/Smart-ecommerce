import clsx from 'clsx';

export default function ShopSection({ title, subtitle, action, children, className, innerClassName }) {
    return (
        <section className={clsx('shop-section', className)}>
            <div className={clsx('shop-container', innerClassName)}>
                {(title || action) && (
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
                        <div>
                            {title && (
                                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {title}
                                </div>
                            )}
                            {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
                        </div>
                        {action}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}
