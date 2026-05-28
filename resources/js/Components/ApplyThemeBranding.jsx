import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function ApplyThemeBranding() {
    const { theme = {} } = usePage().props;

    useEffect(() => {
        if (theme.primary_color) {
            document.documentElement.style.setProperty('--color-brand-primary', theme.primary_color);
        }
        if (theme.secondary_color) {
            document.documentElement.style.setProperty('--color-brand-secondary', theme.secondary_color);
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
