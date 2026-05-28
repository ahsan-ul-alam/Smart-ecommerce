import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export default function ApplyThemeBranding() {
    const { theme = {} } = usePage().props;

    useEffect(() => {
        const root = document.documentElement;
        const primary = theme.primary_color || '#0d9488';
        const secondary = theme.secondary_color || '#f59e0b';

        root.style.setProperty('--color-brand-primary', primary);
        root.style.setProperty('--color-brand-secondary', secondary);

        try {
            const { r, g, b } = hexToRgb(primary);
            root.style.setProperty('--color-brand-primary-rgb', `${r} ${g} ${b}`);
            root.style.setProperty(
                '--shop-gradient-hero',
                `linear-gradient(135deg, ${primary} 0%, color-mix(in srgb, ${primary} 75%, ${secondary}) 55%, color-mix(in srgb, ${secondary} 85%, white) 100%)`,
            );
            root.style.setProperty(
                '--shop-gradient-soft',
                `linear-gradient(135deg, color-mix(in srgb, ${primary} 12%, white) 0%, color-mix(in srgb, ${secondary} 8%, white) 100%)`,
            );
        } catch {
            root.style.setProperty('--shop-gradient-hero', `linear-gradient(135deg, ${primary}, ${secondary})`);
            root.style.setProperty('--shop-gradient-soft', `linear-gradient(135deg, ${primary}22, ${secondary}18)`);
        }

        if (theme.favicon) {
            let link = document.querySelector("link[rel='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = theme.favicon;
        }
    }, [theme.primary_color, theme.secondary_color, theme.favicon]);

    return null;
}
