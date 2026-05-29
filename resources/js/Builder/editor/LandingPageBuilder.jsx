import { useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragOverlay } from '@dnd-kit/core';
import { useState } from 'react';
import ComponentLibrary from './ComponentLibrary';
import BuilderCanvas, { usePanelResize } from './BuilderCanvas';
import PropertyPanel from './PropertyPanel';
import BuilderToolbar from './BuilderToolbar';
import { useBuilderStore } from '../store/builderStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useBuilderKeyboard } from '../hooks/useBuilderKeyboard';
import { normalizeSchema } from '../schema/migrate';
import { ensureNodeIds } from '../schema/migrate';
import { COMPONENT_LABELS } from '../registry/components';

export default function LandingPageBuilder({
    page, catalog, product, onSave, saving, pageSettings,
}) {
    const init = useBuilderStore((s) => s.init);
    const addComponent = useBuilderStore((s) => s.addComponent);
    const left = usePanelResize(260);
    const right = usePanelResize(300);
    const [dragType, setDragType] = useState(null);

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

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
            <BuilderToolbar onSave={onSave} saving={saving} page={page} />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setDragType(e.active.data.current?.type || null)}
                onDragEnd={(e) => {
                    if (e.active.data.current?.fromLibrary) {
                        addComponent(e.active.data.current.type);
                    }
                    setDragType(null);
                }}
            >
                <div className="flex flex-1 min-h-0">
                    {/* Left — Component library */}
                    <aside style={{ width: left.width }} className="shrink-0 border-r bg-white dark:bg-slate-900 flex flex-col min-h-0">
                        <div className="px-3 py-2 border-b text-xs font-bold text-slate-500">Library</div>
                        <ComponentLibrary />
                    </aside>
                    <div role="separator" onMouseDown={(e) => left.onMouseDown(e, 1)} className="w-1 shrink-0 cursor-col-resize hover:bg-teal-400/30 bg-transparent" />

                    {/* Center — Live canvas */}
                    <main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
                        <CanvasInner catalog={catalog} product={product} />
                    </main>

                    <div role="separator" onMouseDown={(e) => right.onMouseDown(e, -1)} className="w-1 shrink-0 cursor-col-resize hover:bg-teal-400/30 bg-transparent" />

                    {/* Right — Properties */}
                    <aside style={{ width: right.width }} className="shrink-0 border-l bg-white dark:bg-slate-900 min-h-0 overflow-hidden flex flex-col">
                        <div className="px-3 py-2 border-b text-xs font-bold text-slate-500">Properties</div>
                        <div className="flex-1 overflow-y-auto">
                            <PropertyPanel catalog={catalog} />
                        </div>
                        {pageSettings}
                    </aside>
                </div>

                <DragOverlay>
                    {dragType ? (
                        <div className="px-3 py-2 bg-teal-600 text-white text-xs rounded-lg shadow-xl">
                            {COMPONENT_LABELS[dragType] || dragType}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

function CanvasInner({ catalog, product }) {
    return (
        <div className="flex-1 overflow-auto">
            <BuilderCanvas catalog={catalog} product={product} />
        </div>
    );
}
