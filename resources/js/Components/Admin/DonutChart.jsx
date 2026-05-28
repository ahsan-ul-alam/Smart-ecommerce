const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#6366f1',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#94a3b8',
    refunded: '#f43f5e',
};

export default function DonutChart({ data = [], size = 160 }) {
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    const r = 36;
    const cx = 50;
    const cy = 50;
    let angle = -90;

    const segments = data.map((item) => {
        const pct = item.count / total;
        const sweep = pct * 360;
        const start = angle;
        angle += sweep;
        const end = angle;
        const large = sweep > 180 ? 1 : 0;
        const rad = (deg) => (deg * Math.PI) / 180;
        const x1 = cx + r * Math.cos(rad(start));
        const y1 = cy + r * Math.sin(rad(start));
        const x2 = cx + r * Math.cos(rad(end));
        const y2 = cy + r * Math.sin(rad(end));
        const path =
            sweep >= 359.9
                ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`
                : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
        return { ...item, path, color: STATUS_COLORS[item.status] || '#94a3b8', pct: Math.round(pct * 100) };
    });

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
                {segments.map((seg) => (
                    <path key={seg.status} d={seg.path} fill={seg.color} className="transition-opacity hover:opacity-90" />
                ))}
                <circle cx={cx} cy={cy} r={22} className="fill-white dark:fill-slate-800" />
                <text x={cx} y={cy - 2} textAnchor="middle" className="fill-slate-800 dark:fill-white text-[11px] font-bold">
                    {total}
                </text>
                <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-400 text-[7px]">
                    orders
                </text>
            </svg>
            <ul className="flex-1 space-y-2 w-full min-w-0">
                {segments.map((seg) => (
                    <li key={seg.status} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="text-slate-600 dark:text-slate-400 truncate">{seg.label}</span>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-white shrink-0">{seg.pct}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
