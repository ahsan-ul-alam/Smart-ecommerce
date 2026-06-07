import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';
import LanguageSwitcher from '../Components/UI/LanguageSwitcher';
import ThemeToggle from '../Components/UI/ThemeToggle';
import { useSyncLocale } from '../hooks/useSyncLocale';

export default function GuestLayout({ children, variant = 'centered' }) {
    useSyncLocale();
    const { app, theme = {} } = usePage().props;
    const isSplit = variant === 'split';

    return (
        <div className={clsx('min-h-screen flex flex-col', isSplit ? 'bg-slate-50 dark:bg-slate-950' : 'shop-mesh-bg')}>
            <ApplyThemeBranding />
            {!isSplit && (
                <header className="p-6 lg:p-8 flex items-center justify-between gap-4">
                    <Link href="/" className="inline-flex items-center">
                        {theme.logo ? (
                            <img src={theme.logo} alt={app?.name} className="h-10 w-auto max-w-[200px] object-contain" />
                        ) : (
                            <span className="text-2xl font-bold text-primary tracking-tight">
                                {app?.name || 'ArCommerze'}
                            </span>
                        )}
                    </Link>
                    <div className="flex items-center gap-1">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </header>
            )}
            <main className={clsx('flex-1 w-full', isSplit ? '' : 'flex items-center justify-center p-6 pb-12')}>
                {isSplit ? children : (
                    <div className="w-full max-w-lg mx-auto px-6">{children}</div>
                )}
            </main>
        </div>
    );
}
