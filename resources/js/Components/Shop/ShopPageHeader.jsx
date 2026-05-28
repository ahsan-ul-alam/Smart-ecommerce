import clsx from 'clsx';
import ShopBreadcrumbs from './ShopBreadcrumbs';

export default function ShopPageHeader({ title, description, breadcrumbs = [], actions, className }) {
    return (
        <header className={clsx('mb-5', className)}>
            <ShopBreadcrumbs items={breadcrumbs} />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                <div className="min-w-0 shrink-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-slate-500 mt-1 text-sm sm:text-base max-w-xl">{description}</p>
                    )}
                </div>
                {actions && (
                    <div className="w-full lg:flex-1 lg:max-w-2xl lg:ml-4">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
