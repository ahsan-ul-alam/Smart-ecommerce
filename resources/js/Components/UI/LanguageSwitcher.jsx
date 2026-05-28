import { router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export default function LanguageSwitcher({ className = '', variant = 'icon' }) {
    const { app } = usePage().props;
    const { i18n, t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const locales = app?.locales ?? [
        { code: 'en', label: 'English' },
        { code: 'bn', label: 'বাংলা' },
    ];
    const current = app?.locale ?? i18n.language ?? 'en';
    const currentLabel = locales.find((l) => l.code === current)?.label ?? current.toUpperCase();

    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const switchLocale = (code) => {
        if (code === current) {
            setOpen(false);
            return;
        }

        setOpen(false);
        i18n.changeLanguage(code);
        localStorage.setItem('locale', code);
        document.documentElement.lang = code;

        router.post('/locale', { locale: code }, {
            preserveScroll: true,
            onSuccess: () => {
                i18n.changeLanguage(code);
            },
        });
    };

    return (
        <div className={clsx('relative', className)} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={clsx(
                    'rounded-xl transition-premium',
                    variant === 'icon'
                        ? 'p-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                        : 'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 hover:border-primary/40',
                )}
                title={t('locale.switch')}
                aria-label={t('locale.switch')}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <Languages size={18} className="text-slate-500 dark:text-slate-400 shrink-0" />
                {variant === 'labeled' && (
                    <span className="text-slate-700 dark:text-slate-200 max-w-[5rem] truncate hidden sm:inline">
                        {currentLabel}
                    </span>
                )}
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 top-full mt-2 min-w-[9rem] py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg z-[70]"
                >
                    {locales.map((loc) => (
                        <li key={loc.code}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={loc.code === current}
                                onClick={() => switchLocale(loc.code)}
                                className={clsx(
                                    'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-left transition-colors',
                                    loc.code === current
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
                                )}
                            >
                                <span>{loc.label}</span>
                                {loc.code === current && <Check size={16} className="shrink-0" />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
