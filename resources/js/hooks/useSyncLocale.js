import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/** Keep i18n in sync with server locale (must run inside an Inertia page/layout). */
export function useSyncLocale() {
    const { app } = usePage().props;
    const { i18n } = useTranslation();

    useEffect(() => {
        const locale = app?.locale;
        if (!locale) {
            return;
        }

        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
            localStorage.setItem('locale', locale);
        }

        document.documentElement.lang = locale;
    }, [app?.locale, i18n]);
}
