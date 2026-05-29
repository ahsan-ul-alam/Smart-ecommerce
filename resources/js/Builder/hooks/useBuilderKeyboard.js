import { useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';

export function useBuilderKeyboard() {
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const copyNode = useBuilderStore((s) => s.copyNode);
    const pasteNode = useBuilderStore((s) => s.pasteNode);
    const duplicateNode = useBuilderStore((s) => s.duplicateNode);
    const removeNode = useBuilderStore((s) => s.removeNode);
    const selectedIds = useBuilderStore((s) => s.selectedIds);

    useEffect(() => {
        const handler = (e) => {
            const mod = e.ctrlKey || e.metaKey;
            const id = selectedIds[0];

            if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
            if (mod && e.key === 'c' && id) { e.preventDefault(); copyNode(id); }
            if (mod && e.key === 'v') { e.preventDefault(); pasteNode(); }
            if (mod && e.key === 'd' && id) { e.preventDefault(); duplicateNode(id); }
            if ((e.key === 'Delete' || e.key === 'Backspace') && id && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                removeNode(id);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo, copyNode, pasteNode, duplicateNode, removeNode, selectedIds]);
}
