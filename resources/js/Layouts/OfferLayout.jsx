import { Link } from '@inertiajs/react';
import ApplyThemeBranding from '../Components/ApplyThemeBranding';
import FlashMessage from '../Components/UI/FlashMessage';
import { themeToCssVars, pageBackgroundStyle, mergeTheme } from '../Builder/schema/themeTokens';

export default function OfferLayout({ children, page = {}, theme = {} }) {
    const t = mergeTheme(theme);
    const cssVars = themeToCssVars(t);

    return (
        <div
            className="min-h-screen flex flex-col text-[var(--offer-text)]"
            style={{
                ...cssVars,
                background: pageBackgroundStyle(t),
            }}
        >
            <ApplyThemeBranding />
            <FlashMessage />
            <header className="border-b border-[var(--offer-primary)]/10 bg-white/90 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <Link href="/" className="text-sm font-bold hover:text-[var(--offer-primary)]">
                        {page.name || 'Offer'}
                    </Link>
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full text-white" style={{ background: 'var(--offer-primary)' }}>
                        Limited offer
                    </span>
                </div>
            </header>
            <main className="flex-1 w-full">{children}</main>
            <footer className="border-t border-[var(--offer-primary)]/10 py-6 text-center text-xs opacity-70">
                Secure checkout · Cash on delivery available
            </footer>
        </div>
    );
}
