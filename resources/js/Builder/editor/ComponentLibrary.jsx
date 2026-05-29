import { useDraggable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { COMPONENT_CATEGORIES, COMPONENT_LABELS, createComponent } from '../registry/components';
import { useBuilderStore } from '../store/builderStore';

export default function ComponentLibrary() {
    return (
        <div className="h-full overflow-y-auto p-3 space-y-4">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Components</p>
            {COMPONENT_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                    <p className="text-xs font-semibold text-slate-500 mb-2">{cat.label}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {cat.items.map((type) => (
                            <LibraryItem key={type} type={type} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function LibraryItem({ type }) {
    const addComponent = useBuilderStore((s) => s.addComponent);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `lib_${type}`,
        data: { fromLibrary: true, type },
    });

    return (
        <button
            ref={setNodeRef}
            type="button"
            {...listeners}
            {...attributes}
            onClick={() => addComponent(type)}
            className={`text-left text-xs px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
        >
            <Plus size={10} className="inline mr-1 opacity-50" />
            {COMPONENT_LABELS[type] || type}
        </button>
    );
}
