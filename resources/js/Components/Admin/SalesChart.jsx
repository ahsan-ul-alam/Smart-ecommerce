import { useMemo, useState } from 'react';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;

export default function SalesChart({ data = [], height = 220 }) {
    const [mode, setMode] = useState('revenue');
    const width = 600;
    const pad = { t: 16, r: 12, b: 28, l: 48 };
    const innerW = width - pad.l - pad.r;
    const innerH = height - pad.t - pad.b;

    const values = useMemo(
        () => data.map((d) => (mode === 'revenue' ? d.revenue : d.orders)),
        [data, mode]
    );
    const max = Math.max(...values, 1);

    const points = values.map((v, i) => {
        const x = pad.l + (i / Math.max(values.length - 1, 1)) * innerW;
        const y = pad.t + innerH - (v / max) * innerH;
        return { x, y, v, label: data[i]?.label };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? pad.l} ${pad.t + innerH} L ${points[0]?.x ?? pad.l} ${pad.t + innerH} Z`;

    return (
        <div>
            <div className="flex items-center justify-end gap-2 mb-4">
                {['revenue', 'orders'].map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-premium ${
                            mode === m
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                    const y = pad.t + innerH * (1 - tick);
                    const val = max * tick;
                    return (
                        <g key={tick}>
                            <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="4 4" />
                            <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                                {mode === 'revenue' ? formatPrice(val) : Math.round(val)}
                            </text>
                        </g>
                    );
                })}
                {points.map((p, i) => (
                    <rect
                        key={i}
                        x={p.x - innerW / data.length / 2 + 4}
                        y={pad.t + innerH - (p.v / max) * innerH * 0.85}
                        width={Math.max(8, innerW / data.length - 8)}
                        height={(p.v / max) * innerH * 0.85}
                        rx="4"
                        className="fill-indigo-500/15"
                    />
                ))}
                <path d={areaPath} className="fill-indigo-500/20" />
                <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-indigo-500 stroke-white dark:stroke-slate-800" strokeWidth="2" />
                ))}
                {points.filter((_, i) => i % 2 === 0 || i === points.length - 1).map((p, i) => (
                    <text key={i} x={p.x} y={height - 6} textAnchor="middle" className="fill-slate-400 text-[10px]">
                        {p.label}
                    </text>
                ))}
            </svg>
        </div>
    );
}
