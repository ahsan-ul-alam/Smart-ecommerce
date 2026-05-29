import { useEffect, useState } from 'react';
import {
    DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragOverlay,
} from '@dnd-kit/core';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import CanvasEditor from './CanvasEditor';
import WidgetPanel from './WidgetPanel';
import LayersPanel from './LayersPanel';
import InspectorPanel from './InspectorPanel';
import BuilderToolbar from './BuilderToolbar';
import PanelTabs from './PanelTabs';
import { useBuilderStore } from '../store/builderStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useBuilderKeyboard } from '../hooks/useBuilderKeyboard';
import { usePanelResize } from '../hooks/usePanelResize';
import { normalizeSchema, ensureNodeIds } from '../schema/migrate';
import { COMPONENT_LABELS } from '../registry/components';
import { themeToCssVars } from '../schema/themeTokens';
import { getCanvasBlocks, parseInsertDropId } from '../utils/builderTree';
import { getComponentIcon } from '../registry/icons';

export default function LandingPageBuilder({
    page, catalog, product, onSave, saving, pageSettings, backHref, checkoutPreview,
}) {
    const init = useBuilderStore((s) => s.init);
    const addComponent = useBuilderStore((s) => s.addComponent);
    const reorderCanvasBlocks = useBuilderStore((s) => s.reorderCanvasBlocks);
    const select = useBuilderStore((s) => s.select);
    const left = usePanelResize(280);
    const right = usePanelResize(320);
    const [leftTab, setLeftTab] = useState('widgets');
    const [dragging, setDragging] = useState(null);

    const theme = useBuilderStore((s) => s.theme);
    const cssVars = themeToCssVars(theme);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    useEffect(() => {
        const schema = normalizeSchema(
            page.schema?.roots?.length ? page.schema : { blocks: page.blocks, theme: page.theme },
            page.theme,
        );
        schema.roots = ensureNodeIds(schema.roots);
        init(schema);
    }, [page.id]);

    useAutoSave(page.id);
    useBuilderKeyboard();

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setDragging(null);
        if (!over) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeData?.fromLibrary) {
            const type = activeData.type;
            const insert = parseInsertDropId(String(over.id));
            if (insert) {
                addComponent(type, null, insert.index);
            } else if (over.id === 'canvas-drop') {
                addComponent(type);
            }
            return;
        }

        if (activeData?.sortable) {
            const blocks = getCanvasBlocks(useBuilderStore.getState().roots);
            const fromIndex = blocks.findIndex((b) => b.id === active.id);
            if (fromIndex < 0) return;

            let toIndex = fromIndex;
            const insert = parseInsertDropId(String(over.id));
            if (insert) {
                toIndex = insert.index;
                if (fromIndex < toIndex) toIndex -= 1;
            } else if (overData?.sortable) {
                toIndex = blocks.findIndex((b) => b.id === over.id);
            }

            if (toIndex >= 0 && fromIndex !== toIndex) {
                reorderCanvasBlocks(fromIndex, toIndex);
            }
        }
    };

    const DragIcon = dragging?.type ? getComponentIcon(dragging.type) : null;

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] border rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-sm" style={cssVars}>
            <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-white dark:bg-slate-900 shrink-0">
                {backHref && (
                    <Link href={backHref} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 shrink-0" title="Back to pages">
                        <ArrowLeft size={18} />
                    </Link>
                )}
                <div className="min-w-0 mr-2 hidden sm:block">
                    <p className="text-sm font-bold truncate">{page.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">/offer/{page.slug}</p>
                </div>
                <div className="flex-1 min-w-0">
                    <BuilderToolbar onSave={onSave} saving={saving} page={page} embedded />
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => {
                    const data = e.active.data.current;
                    setDragging(data?.fromLibrary ? { type: data.type, fromLibrary: true } : { type: null, blockId: e.active.id });
                }}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setDragging(null)}
            >
                <div className="flex flex-1 min-h-0 flex-col">
                <div className="flex flex-1 min-h-0">
                    <aside style={{ width: left.width }} className="shrink-0 border-r bg-white dark:bg-slate-900 flex flex-col min-h-0">
                        <PanelTabs
                            tabs={[
                                { id: 'widgets', label: 'Widgets' },
                                { id: 'layers', label: 'Layers' },
                            ]}
                            active={leftTab}
                            onChange={setLeftTab}
                        />
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {leftTab === 'widgets' ? <WidgetPanel /> : <LayersPanel />}
                        </div>
                    </aside>

                    <div role="separator" onMouseDown={(e) => left.onMouseDown(e, 1)} className="w-1 shrink-0 cursor-col-resize hover:bg-[var(--offer-primary)]/30 bg-transparent" title="Resize panel" />

                    <main className="flex-1 min-w-0 min-h-0 flex flex-col bg-slate-200/60 dark:bg-slate-900/40" onClick={() => select(null)}>
                        <CanvasEditor catalog={catalog} product={product} page={page} checkoutPreview={checkoutPreview} dragActive={!!dragging} />
                    </main>

                    <div role="separator" onMouseDown={(e) => right.onMouseDown(e, -1)} className="w-1 shrink-0 cursor-col-resize hover:bg-[var(--offer-primary)]/30 bg-transparent" title="Resize panel" />

                    <aside style={{ width: right.width }} className="shrink-0 border-l bg-white dark:bg-slate-900 min-h-0 overflow-hidden flex flex-col">
                        <InspectorPanel catalog={catalog} pageSettings={pageSettings} />
                    </aside>
                </div>

                <DragOverlay dropAnimation={null}>
                    {dragging?.fromLibrary && dragging.type ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--offer-primary)] text-white text-xs rounded-lg shadow-xl">
                            {DragIcon && <DragIcon size={14} />}
                            {COMPONENT_LABELS[dragging.type] || dragging.type}
                        </div>
                    ) : null}
                </DragOverlay>
                </div>
            </DndContext>
        </div>
    );
}
