import { useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { useBuilderStore } from '../store/builderStore';
import { stripEditorMeta, collectMediaFiles } from '../schema/defaults';

export function useAutoSave(pageId, enabled = true, delayMs = 2500) {
    const isDirty = useBuilderStore((s) => s.isDirty);
    const markSaved = useBuilderStore((s) => s.markSaved);
    const getSchema = useBuilderStore((s) => s.getSchema);
    const roots = useBuilderStore((s) => s.roots);
    const timer = useRef(null);

    const save = useCallback(async () => {
        const schema = getSchema();
        const clean = { ...schema, roots: stripEditorMeta(schema.roots) };
        const media = collectMediaFiles(roots);
        const hasMedia = Object.keys(media).length > 0;

        try {
            if (hasMedia) {
                const fd = new FormData();
                fd.append('schema', JSON.stringify(clean));
                Object.entries(media).forEach(([id, file]) => {
                    if (Array.isArray(file)) file.forEach((f) => fd.append(`block_media[${id}][]`, f));
                    else fd.append(`block_media[${id}]`, file);
                });
                await axios.post(`/admin/special-products/${pageId}/autosave`, fd, {
                    headers: { 'X-HTTP-Method-Override': 'PATCH' },
                });
            } else {
                await axios.patch(`/admin/special-products/${pageId}/autosave`, { schema: clean });
            }
            markSaved();
        } catch {
            // silent fail — user can manual save
        }
    }, [pageId, getSchema, roots, markSaved]);

    useEffect(() => {
        if (!enabled || !isDirty) return undefined;
        timer.current = setTimeout(save, delayMs);
        return () => clearTimeout(timer.current);
    }, [enabled, isDirty, roots, save, delayMs]);

    return { saveNow: save };
}
