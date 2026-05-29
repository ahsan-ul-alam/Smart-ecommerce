import { useState } from 'react';
import PageRenderer from '../engine/PageRenderer';
import { useBuilderStore } from '../store/builderStore';
import { DEVICE_WIDTH } from '../schema/defaults';

export default function BuilderCanvas({ catalog, product }) {
    const roots = useBuilderStore((s) => s.roots);
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const theme = useBuilderStore((s) => s.theme);
    const selectedIds = useBuilderStore((s) => s.selectedIds);
    const select = useBuilderStore((s) => s.select);

    return (
        <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-4 min-h-full overflow-auto">
            <div
                className="bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 min-h-[600px] w-full"
                style={{ maxWidth: DEVICE_WIDTH[breakpoint] || '100%' }}
                onClick={() => select(null)}
                role="presentation"
            >
                {roots.length === 0 ? (
                    <div className="flex items-center justify-center h-96 text-slate-400 text-sm border-2 border-dashed m-4 rounded-xl">
                        Drag a component from the library or click to add
                    </div>
                ) : (
                    <PageRenderer
                        schema={{ version: 2, theme, roots }}
                        catalog={catalog}
                        product={product}
                        breakpoint={breakpoint}
                        editorMode
                        selectedIds={selectedIds}
                        onSelect={select}
                    />
                )}
            </div>
        </div>
    );
}

export function usePanelResize(initial = 280) {
    const [width, setWidth] = useState(initial);

    const onMouseDown = (e, side = 1) => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = width;
        const move = (ev) => setWidth(Math.max(200, Math.min(480, startW + (ev.clientX - startX) * side)));
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    return { width, onMouseDown };
}
