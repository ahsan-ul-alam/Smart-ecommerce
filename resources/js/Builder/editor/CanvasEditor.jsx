import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { NodeRenderer } from '../engine/PageRenderer';
import { COMPONENT_LABELS } from '../registry/components';
import { getComponentIcon } from '../registry/icons';
import { useBuilderStore } from '../store/builderStore';
import { getCanvasBlocks } from '../utils/builderTree';
import { DEVICE_WIDTH } from '../schema/defaults';
import { themeToCssVars, pageBackgroundStyle } from '../schema/themeTokens';
import InsertDropZone from './InsertDropZone';

export default function CanvasEditor({ catalog, product, dragActive }) {
    const roots = useBuilderStore((s) => s.roots);
    const theme = useBuilderStore((s) => s.theme);
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const blocks = getCanvasBlocks(roots);
    const ids = blocks.map((b) => b.id);
    const cssVars = themeToCssVars(theme);

    const { setNodeRef: setCanvasRef, isOver: canvasOver } = useDroppable({
        id: 'canvas-drop',
        data: { insertIndex: blocks.length },
    });

    return (
        <div className="flex-1 overflow-auto p-6" style={{ ...cssVars, background: pageBackgroundStyle(theme) }}>
            <div
                className="mx-auto transition-all duration-300 rounded-xl shadow-lg border border-slate-200/80 overflow-hidden bg-[var(--offer-bg)]"
                style={{ maxWidth: DEVICE_WIDTH[breakpoint] || '100%', width: '100%' }}
            >
                <div ref={setCanvasRef} className={`min-h-[480px] p-4 ${canvasOver && !blocks.length ? 'ring-2 ring-[var(--offer-primary)] ring-dashed' : ''}`}>
                    {!blocks.length ? (
                        <EmptyCanvas dragActive={dragActive || canvasOver} />
                    ) : (
                        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                            <InsertDropZone index={0} active={dragActive} />
                            {blocks.map((block, index) => (
                                <CanvasBlock
                                    key={block.id}
                                    block={block}
                                    index={index}
                                    catalog={catalog}
                                    product={product}
                                    theme={theme}
                                    breakpoint={breakpoint}
                                    dragActive={dragActive}
                                />
                            ))}
                            <InsertDropZone index={blocks.length} active={dragActive} />
                        </SortableContext>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyCanvas({ dragActive }) {
    return (
        <div className={`flex flex-col items-center justify-center h-80 rounded-xl border-2 border-dashed text-center px-6 ${dragActive ? 'border-[var(--offer-primary)] bg-[var(--offer-primary-light)]' : 'border-slate-300'}`}>
            <p className="text-sm font-semibold text-slate-600">Drop widgets here</p>
            <p className="text-xs text-slate-400 mt-1">Drag from the left panel, or use Templates in the toolbar</p>
        </div>
    );
}

function CanvasBlock({ block, index, catalog, product, theme, breakpoint, dragActive }) {
    const selectedIds = useBuilderStore((s) => s.selectedIds);
    const select = useBuilderStore((s) => s.select);
    const duplicateNode = useBuilderStore((s) => s.duplicateNode);
    const removeNode = useBuilderStore((s) => s.removeNode);
    const selected = selectedIds.includes(block.id);
    const Icon = getComponentIcon(block.type);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
        data: { sortable: true, blockId: block.id },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`group relative mb-1 rounded-xl transition-shadow ${selected ? 'ring-2 ring-[var(--offer-primary)] shadow-md' : 'hover:ring-1 hover:ring-slate-300'} ${isDragging ? 'opacity-60' : ''}`}
                onClick={(e) => { e.stopPropagation(); select(block.id); }}
                onKeyDown={(e) => e.key === 'Enter' && select(block.id)}
                role="button"
                tabIndex={0}
            >
                <div className={`flex items-center gap-1 px-2 py-1.5 rounded-t-xl border border-b-0 text-[11px] ${selected ? 'bg-[var(--offer-primary)] text-white border-[var(--offer-primary)]' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    <button type="button" {...listeners} {...attributes} className="p-1 cursor-grab rounded hover:bg-black/10" onClick={(e) => e.stopPropagation()}>
                        <GripVertical size={14} />
                    </button>
                    <Icon size={13} />
                    <span className="font-semibold flex-1 truncate">{COMPONENT_LABELS[block.type] || block.type}</span>
                    <button type="button" className="p-1 rounded hover:bg-black/10" onClick={(e) => { e.stopPropagation(); duplicateNode(block.id); }} title="Duplicate">
                        <Copy size={13} />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-red-500/20" onClick={(e) => { e.stopPropagation(); removeNode(block.id); }} title="Delete">
                        <Trash2 size={13} />
                    </button>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-xl bg-white overflow-hidden pointer-events-none">
                    <div className="p-3 sm:p-4">
                        <NodeRenderer
                            node={block}
                            breakpoint={breakpoint}
                            catalog={catalog}
                            product={product}
                            editorMode={false}
                        />
                    </div>
                </div>
            </div>
            <InsertDropZone index={index + 1} active={dragActive} />
        </>
    );
}
