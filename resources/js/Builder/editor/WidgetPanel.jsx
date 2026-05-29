import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search } from 'lucide-react';
import { COMPONENT_CATEGORIES, COMPONENT_LABELS } from '../registry/components';
import { getComponentIcon } from '../registry/icons';
import { useBuilderStore } from '../store/builderStore';

export default function WidgetPanel() {
    const [query, setQuery] = useState('');
    const addComponent = useBuilderStore((s) => s.addComponent);
    const q = query.trim().toLowerCase();

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b shrink-0">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        placeholder="Search widgets…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {COMPONENT_CATEGORIES.map((cat) => {
                    const items = cat.items.filter((type) => {
                        const label = COMPONENT_LABELS[type] || type;
                        return !q || label.toLowerCase().includes(q) || type.includes(q);
                    });
                    if (!items.length) return null;
                    return (
                        <div key={cat.id}>
                            <p className="px-1 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{cat.label}</p>
                            <div className="space-y-1">
                                {items.map((type) => (
                                    <WidgetItem key={type} type={type} onAdd={() => addComponent(type)} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function WidgetItem({ type, onAdd }) {
    const Icon = getComponentIcon(type);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `lib_${type}`,
        data: { fromLibrary: true, type },
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[var(--offer-primary)] hover:shadow-sm transition-all ${isDragging ? 'opacity-40' : ''}`}
        >
            <button
                type="button"
                {...listeners}
                {...attributes}
                className="p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-[var(--offer-primary)]"
                title="Drag to canvas"
            >
                <Icon size={16} />
            </button>
            <button type="button" onClick={onAdd} className="flex-1 text-left py-2 pr-3 text-xs font-medium truncate">
                {COMPONENT_LABELS[type] || type}
            </button>
        </div>
    );
}
