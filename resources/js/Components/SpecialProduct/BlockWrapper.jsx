const PADDING = { none: '', sm: 'py-4', normal: 'py-8', lg: 'py-12' };
const WIDTH = { full: 'w-full', narrow: 'max-w-2xl mx-auto', wide: 'max-w-4xl mx-auto' };

export default function BlockWrapper({ block, children, className = '' }) {
    const s = block?.style || {};
    const align = s.align || block?.align || 'left';

    return (
        <div
            className={[
                PADDING[s.paddingY] || PADDING.normal,
                WIDTH[s.width] || WIDTH.full,
                align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                backgroundColor: s.background || undefined,
                color: s.textColor || undefined,
            }}
        >
            {children}
        </div>
    );
}
