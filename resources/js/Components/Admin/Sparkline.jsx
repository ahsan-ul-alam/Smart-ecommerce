export default function Sparkline({ data = [], valueKey = 'revenue', width = 120, height = 36, color = '#6366f1' }) {
    if (!data.length) {
        return <svg width={width} height={height} className="opacity-30" />;
    }

    const values = data.map((d) => Number(d[valueKey]) || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const pad = 2;
    const w = width - pad * 2;
    const h = height - pad * 2;

    const points = values.map((v, i) => {
        const x = pad + (i / Math.max(values.length - 1, 1)) * w;
        const y = pad + h - ((v - min) / Math.max(max - min, 1)) * h;
        return `${x},${y}`;
    });

    const area = `${pad},${pad + h} ${points.join(' ')} ${pad + w},${pad + h}`;

    return (
        <svg width={width} height={height} className="overflow-visible">
            <defs>
                <linearGradient id={`spark-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#spark-${valueKey})`} />
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points.join(' ')}
            />
        </svg>
    );
}
