import { Link, usePage } from '@inertiajs/react';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';

export default function GuestLayout({ children }) {
    const { app, theme = {} } = usePage().props;

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
            <ApplyThemeBranding />
            <header className="p-6">
                <Link href="/" className="inline-flex items-center">
                    {theme.logo ? (
                        <img src={theme.logo} alt={app?.name} className="h-10 w-auto max-w-[200px] object-contain" />
                    ) : (
                        <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                            {app?.name || 'ArCommerze'}
                        </span>
                    )}
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center p-6">{children}</main>
        </div>
    );
}
