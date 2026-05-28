import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import bn from './locales/bn.json';

const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;

i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, bn: { translation: bn } },
    lng: storedLocale || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
});

if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.language;
}

export default i18n;
