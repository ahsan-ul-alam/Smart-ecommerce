import { Link } from '@inertiajs/react';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';
import FlashMessage from '../Components/UI/FlashMessage';

export default function OfferLayout({ children, page = {}, theme = {} }) {
    const primary = theme.primary_color || '#0d9488';
    const secondary = theme.secondary_color || '#f59e0b';
    const gradient = theme.background_style === 'gradient';

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                '--offer-primary': primary,
                '--offer-secondary': secondary,
                background: gradient
                    ? `linear-gradient(180deg, color-mix(in srgb, ${primary} 8%, white) 0%, white 40%, color-mix(in srgb, ${secondary} 6%, white) 100%)`
                    : undefined,
            }}
        >
            <ApplyThemeBranding />
            <FlashMessage />
            <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <Link href="/" className="text-sm font-bold text-slate-800 hover:text-[var(--offer-primary)]">
                        {page.name || 'Offer'}
                    </Link>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--offer-primary)]">
                        Limited offer
                    </span>
                </div>
            </header>
            <main className="flex-1 w-full">{children}</main>
            <footer className="border-t py-6 text-center text-xs text-slate-500">
                Secure checkout · Cash on delivery available
            </footer>
        </div>
    );
}
