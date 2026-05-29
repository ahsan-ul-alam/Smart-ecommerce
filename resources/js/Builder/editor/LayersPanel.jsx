import { COMPONENT_LABELS } from '../registry/components';
import { getComponentIcon } from '../registry/icons';
import { useBuilderStore } from '../store/builderStore';
import { getCanvasBlocks } from '../utils/builderTree';

export default function LayersPanel() {
    const roots = useBuilderStore((s) => s.roots);
    const selectedIds = useBuilderStore((s) => s.selectedIds);
    const select = useBuilderStore((s) => s.select);
    const blocks = getCanvasBlocks(roots);

    if (!blocks.length) {
        return <p className="p-4 text-xs text-slate-500">No blocks yet. Drag widgets onto the canvas.</p>;
    }

    return (
        <div className="p-2 space-y-0.5">
            {blocks.map((block, i) => {
                const Icon = getComponentIcon(block.type);
                const selected = selectedIds.includes(block.id);
                return (
                    <button
                        key={block.id}
                        type="button"
                        onClick={() => select(block.id)}
                        className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-left ${selected ? 'bg-[var(--offer-primary-light)] ring-1 ring-[var(--offer-primary)]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <span className="text-[10px] text-slate-400 w-4 shrink-0">{i + 1}</span>
                        <Icon size={14} className="shrink-0 text-slate-500" />
                        <span className="truncate font-medium">{COMPONENT_LABELS[block.type] || block.type}</span>
                    </button>
                );
            })}
        </div>
    );
}
