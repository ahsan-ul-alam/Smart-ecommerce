import Sparkline from './Sparkline';
import clsx from 'clsx';

const iconColors = {
    indigo: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
    sky: 'bg-sky-500/10 text-sky-600 ring-sky-500/20',
    violet: 'bg-violet-500/10 text-violet-600 ring-violet-500/20',
};

export default function KpiCard({
    title, value, icon: Icon, trend, sparkData, sparkKey = 'revenue', color = 'indigo',
    subtitle, trendLabel = 'vs previous period',
}) {
    const up = trend >= 0;

    return (
        <div className="admin-card p-5 flex flex-col gap-3">
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
                    <div className={clsx('p-2.5 rounded-xl ring-1 shrink-0', iconColors[color])}>
                        <Icon size={20} strokeWidth={1.75} />
                    </div>
                )}
            </div>
            {sparkData?.length > 0 && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-700/80">
                    <Sparkline data={sparkData} valueKey={sparkKey} color={color === 'emerald' ? '#10b981' : '#6366f1'} />
                </div>
            )}
        </div>
    );
}
