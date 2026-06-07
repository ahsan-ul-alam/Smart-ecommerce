import Sparkline from './Sparkline';
import clsx from 'clsx';

const iconColors = {
    primary: 'bg-primary/10 text-primary ring-primary/20',
    secondary: 'bg-secondary/10 text-secondary ring-secondary/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
    sky: 'bg-sky-500/10 text-sky-600 ring-sky-500/20',
    indigo: 'bg-primary/10 text-primary ring-primary/20',
    violet: 'bg-secondary/10 text-secondary ring-secondary/20',
};

const sparkColors = {
    primary: 'var(--color-brand-primary)',
    secondary: 'var(--color-brand-secondary)',
    emerald: '#10b981',
    amber: '#f59e0b',
    sky: '#0ea5e9',
    indigo: 'var(--color-brand-primary)',
    violet: 'var(--color-brand-secondary)',
};

export default function KpiCard({
    title, value, icon: Icon, trend, sparkData, sparkKey = 'revenue', color = 'primary',
    subtitle, trendLabel = 'vs previous period',
}) {
    const up = trend >= 0;

    return (
        <div className="admin-card p-5 flex flex-col gap-3 hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                    )}
                    {trend !== undefined && trend !== null && (
                        <p className={clsx('text-xs font-semibold mt-1.5 flex items-center gap-1', up ? 'text-emerald-600' : 'text-red-500')}>
                            {up ? '↑' : '↓'} {Math.abs(trend)}%
                            <span className="text-slate-400 font-normal">{trendLabel}</span>
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={clsx('p-2.5 rounded-xl ring-1 shrink-0', iconColors[color] ?? iconColors.primary)}>
                        <Icon size={20} strokeWidth={1.75} />
                    </div>
                )}
            </div>
            {sparkData?.length > 0 && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-700/80">
                    <Sparkline
                        data={sparkData}
                        valueKey={sparkKey}
                        color={sparkColors[color] ?? sparkColors.primary}
                    />
                </div>
            )}
        </div>
    );
}
