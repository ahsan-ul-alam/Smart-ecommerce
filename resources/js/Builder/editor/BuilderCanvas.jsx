import PageRenderer from '../engine/PageRenderer';
import { useBuilderStore } from '../store/builderStore';
import { DEVICE_WIDTH } from '../schema/defaults';
import { themeToCssVars, pageBackgroundStyle } from '../schema/themeTokens';

export default function BuilderCanvas({ catalog, product }) {
    const roots = useBuilderStore((s) => s.roots);
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const theme = useBuilderStore((s) => s.theme);
    const selectedIds = useBuilderStore((s) => s.selectedIds);
    const select = useBuilderStore((s) => s.select);
    const cssVars = themeToCssVars(theme);

    return (
        <div className="flex justify-center p-4 min-h-full overflow-auto" style={{ ...cssVars, background: pageBackgroundStyle(theme) }}>
            <div
                className="bg-[var(--offer-bg)] text-[var(--offer-text)] shadow-xl rounded-lg overflow-hidden transition-all duration-300 min-h-[600px] w-full"
                style={{ maxWidth: DEVICE_WIDTH[breakpoint] || '100%' }}
                onClick={() => select(null)}
                role="presentation"
            >
                {roots.length === 0 ? (
                    <div className="flex items-center justify-center h-96 text-slate-400 text-sm border-2 border-dashed m-4 rounded-xl">
                        Open <strong className="mx-1">Templates</strong> or drag components from the library
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

export { usePanelResize } from '../hooks/usePanelResize';
