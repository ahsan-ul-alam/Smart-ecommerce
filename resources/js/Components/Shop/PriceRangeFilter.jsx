import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const formatPrice = (n, sym) => `${sym}${Number(n).toLocaleString('en-BD')}`;

export default function PriceRangeFilter({
    priceMin = 0,
    priceMax = 10000,
    filters = {},
    onApply,
    onClear,
}) {
    const { t } = useTranslation();
    const sym = '৳';
    const boundsMin = Number(priceMin);
    const boundsMax = Number(priceMax);
    const span = Math.max(boundsMax - boundsMin, 1);
    const step = Math.max(1, Math.round(span / 200));

    const resolveMin = useCallback(
        () => (filters.min_price != null && filters.min_price !== ''
            ? Number(filters.min_price)
            : boundsMin),
        [filters.min_price, boundsMin],
    );

    const resolveMax = useCallback(
        () => (filters.max_price != null && filters.max_price !== ''
            ? Number(filters.max_price)
            : boundsMax),
        [filters.max_price, boundsMax],
    );

    const [rangeMin, setRangeMin] = useState(resolveMin);
    const [rangeMax, setRangeMax] = useState(resolveMax);
    const [activeThumb, setActiveThumb] = useState(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        setRangeMin(resolveMin());
        setRangeMax(resolveMax());
    }, [resolveMin, resolveMax]);

    const isActive = filters.min_price != null && filters.min_price !== ''
        || filters.max_price != null && filters.max_price !== '';

    const commitRange = useCallback((min, max) => {
        const clampedMin = Math.min(Math.max(min, boundsMin), boundsMax);
        const clampedMax = Math.min(Math.max(max, boundsMin), boundsMax);
        const finalMin = Math.min(clampedMin, clampedMax);
        const finalMax = Math.max(clampedMin, clampedMax);

        if (finalMin <= boundsMin && finalMax >= boundsMax) {
            onClear();
            return;
        }

        onApply({ min_price: finalMin, max_price: finalMax });
    }, [boundsMin, boundsMax, onApply, onClear]);

    const scheduleCommit = useCallback((min, max) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => commitRange(min, max), 350);
    }, [commitRange]);

    useEffect(() => () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    }, []);

    const minValue = Math.min(rangeMin, rangeMax);
    const maxValue = Math.max(rangeMin, rangeMax);
    const fillLeft = ((minValue - boundsMin) / span) * 100;
    const fillWidth = ((maxValue - minValue) / span) * 100;

    const handleMinChange = (value) => {
        const nextMin = Math.min(Number(value), maxValue);
        setRangeMin(nextMin);
        scheduleCommit(nextMin, maxValue);
    };

    const handleMaxChange = (value) => {
        const nextMax = Math.max(Number(value), minValue);
        setRangeMax(nextMax);
        scheduleCommit(minValue, nextMax);
    };

    const presets = [
        { min: boundsMin, max: Math.round(boundsMin + span * 0.2) },
        { min: Math.round(boundsMin + span * 0.2), max: Math.round(boundsMin + span * 0.5) },
        { min: Math.round(boundsMin + span * 0.5), max: boundsMax },
    ].filter((p, i, arr) => p.max > p.min && (i === 0 || p.min !== arr[i - 1]?.max));

    return (
        <div className="shop-filter-card">
            <h3 className="shop-filter-title">{t('shop.price_range')}</h3>
            <p className="text-xs text-slate-500 mb-4">
                {formatPrice(minValue, sym)} – {formatPrice(maxValue, sym)}
            </p>

            <div className="shop-dual-range">
                <div className="shop-dual-range__track" aria-hidden="true">
                    <div className="shop-dual-range__rail" />
                    <div
                        className="shop-dual-range__fill"
                        style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={boundsMin}
                    max={boundsMax}
                    step={step}
                    value={minValue}
                    onChange={(e) => handleMinChange(e.target.value)}
                    onPointerDown={() => setActiveThumb('min')}
                    onPointerUp={() => setActiveThumb(null)}
                    onBlur={() => setActiveThumb(null)}
                    className={`shop-dual-range__input shop-dual-range__input--min${activeThumb === 'min' ? ' shop-dual-range__input--active' : ''}`}
                    aria-label="Minimum price"
                    aria-valuemin={boundsMin}
                    aria-valuemax={boundsMax}
                    aria-valuenow={minValue}
                />
                <input
                    type="range"
                    min={boundsMin}
                    max={boundsMax}
                    step={step}
                    value={maxValue}
                    onChange={(e) => handleMaxChange(e.target.value)}
                    onPointerDown={() => setActiveThumb('max')}
                    onPointerUp={() => setActiveThumb(null)}
                    onBlur={() => setActiveThumb(null)}
                    className={`shop-dual-range__input shop-dual-range__input--max${activeThumb === 'max' ? ' shop-dual-range__input--active' : ''}`}
                    aria-label="Maximum price"
                    aria-valuemin={boundsMin}
                    aria-valuemax={boundsMax}
                    aria-valuenow={maxValue}
                />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-2 tabular-nums">
                <span>{formatPrice(boundsMin, sym)}</span>
                <span>{formatPrice(boundsMax, sym)}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
                {presets.map((p) => (
                    <button
                        key={`${p.min}-${p.max}`}
                        type="button"
                        onClick={() => {
                            setRangeMin(p.min);
                            setRangeMax(p.max);
                            commitRange(p.min, p.max);
                        }}
                        className="shop-price-chip"
                    >
                        {formatPrice(p.min, sym)} – {formatPrice(p.max, sym)}
                    </button>
                ))}
                {isActive && (
                    <button type="button" onClick={onClear} className="text-xs text-primary font-medium hover:underline">
                        {t('shop.reset')}
                    </button>
                )}
            </div>
        </div>
    );
}
