import { useDroppable } from '@dnd-kit/core';

export default function InsertDropZone({ index, active }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `insert-${index}`,
        data: { insertIndex: index },
    });

    const highlight = isOver || active;

    return (
        <div
            ref={setNodeRef}
            className={`relative transition-all ${highlight ? 'h-10 my-1' : 'h-2 my-0.5'} flex items-center justify-center`}
        >
            <div className={`w-full rounded-full transition-all ${highlight ? 'h-1.5 bg-[var(--offer-primary)]' : 'h-0.5 bg-transparent hover:bg-slate-200'}`} />
            {highlight && <span className="absolute text-[10px] font-semibold text-[var(--offer-primary)] pointer-events-none">Drop here</span>}
        </div>
    );
}
