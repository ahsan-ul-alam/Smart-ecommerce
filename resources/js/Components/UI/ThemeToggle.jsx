import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import clsx from 'clsx';

export default function ThemeToggle({ className = '' }) {
    const { dark, toggle } = useTheme();
    const { t } = useTranslation();

    return (
        <button
            type="button"
            onClick={toggle}
            className={clsx(
                'p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-premium',
                className,
            )}
            title={dark ? t('theme.light') : t('theme.dark')}
            aria-label={dark ? t('theme.light') : t('theme.dark')}
        >
            {dark ? (
                <Sun size={18} className="text-amber-400" />
            ) : (
                <Moon size={18} className="text-slate-500" />
            )}
        </button>
    );
}
