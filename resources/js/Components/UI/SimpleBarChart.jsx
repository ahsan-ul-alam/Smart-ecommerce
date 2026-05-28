export default function SimpleBarChart({ data, valueKey = 'value', labelKey = 'label', formatValue, color = 'bg-teal-500' }) {
    const max = Math.max(...data.map((d) => d[valueKey]), 1);
    const fmt = formatValue ?? ((n) => n);

    return (
        <div className="space-y-2">
            {data.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-16 shrink-0 text-slate-500 text-xs truncate" title={item[labelKey]}>
                        {item[labelKey]}
                    </span>
                    <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
                        <div
                            className={`h-full ${color} rounded transition-all min-w-[2px]`}
                            style={{ width: `${(item[valueKey] / max) * 100}%` }}
                        />
                    </div>
                    <span className="w-20 text-right font-medium text-slate-700 dark:text-slate-200 shrink-0">
                        {fmt(item[valueKey])}
                    </span>
                </div>
            ))}
            {data.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No data for this period</p>}
        </div>
    );
}
