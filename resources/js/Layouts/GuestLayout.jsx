import { Link, usePage } from '@inertiajs/react';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';

export default function GuestLayout({ children }) {
    const { app, theme = {} } = usePage().props;

    return (
        <div className="min-h-screen shop-mesh-bg flex flex-col">
            <ApplyThemeBranding />
            <header className="p-6 lg:p-8">
                <Link href="/" className="inline-flex items-center">
                    {theme.logo ? (
                        <img src={theme.logo} alt={app?.name} className="h-10 w-auto max-w-[200px] object-contain" />
                    ) : (
                        <span className="text-2xl font-bold text-primary tracking-tight">
                            {app?.name || 'ArCommerze'}
                        </span>
                    )}
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center p-6 pb-12 w-full">
                <div className="w-full max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
