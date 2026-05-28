import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';

const appName = import.meta.env.VITE_APP_NAME || 'ArCommerze';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const initialTheme = props.initialPage?.props?.theme ?? {};
        const serverLocale = props.initialPage?.props?.app?.locale;

        if (serverLocale && i18n.language !== serverLocale) {
            i18n.changeLanguage(serverLocale);
            localStorage.setItem('locale', serverLocale);
        }

        createRoot(el).render(
            <I18nextProvider i18n={i18n}>
                <ThemeProvider initialTheme={initialTheme}>
                    <App {...props} />
                </ThemeProvider>
            </I18nextProvider>
        );
    },
    progress: {
        color: '#0f766e',
    },
});
