import { create } from 'zustand';
import { cloneNode, findNode, walkNodes } from '../schema/defaults';
import { mergeTheme } from '../schema/themeTokens';
import { createComponent, LAYOUT_TYPES } from '../registry/components';
import { ensurePageStructure, getPrimaryContainerId, getCanvasBlocks, findBlockLocation } from '../utils/builderTree';

const MAX_HISTORY = 50;

function snapshot(state) {
    return JSON.parse(JSON.stringify({ roots: state.roots, theme: state.theme }));
}

function pushHistory(state) {
    const snap = snapshot(state);
    const past = [...state.past, snap].slice(-MAX_HISTORY);
    return { past, future: [] };
}

function updateTree(roots, nodeId, updater) {
    const clone = JSON.parse(JSON.stringify(roots));
    let updated = false;

    const walk = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === nodeId) {
                nodes[i] = updater(nodes[i]);
                updated = true;
                return;
            }
            if (nodes[i].children) walk(nodes[i].children);
        }
    };
    walk(clone);
    return updated ? clone : roots;
}

function removeFromTree(roots, nodeId) {
    const clone = JSON.parse(JSON.stringify(roots));

    const walk = (nodes) => {
        const idx = nodes.findIndex((n) => n.id === nodeId);
        if (idx >= 0) {
            nodes.splice(idx, 1);
            return true;
        }
        for (const n of nodes) {
            if (n.children && walk(n.children)) return true;
        }
        return false;
    };
    walk(clone);
    return clone;
}

function insertIntoTree(roots, parentId, node, index = -1) {
    const clone = JSON.parse(JSON.stringify(roots));
    if (!parentId) {
        if (index >= 0) clone.splice(index, 0, node);
        else clone.push(node);
        return clone;
    }

    const walk = (nodes) => {
        for (const n of nodes) {
            if (n.id === parentId && n.children) {
                if (index >= 0) n.children.splice(index, 0, node);
                else n.children.push(node);
                return true;
            }
            if (n.children && walk(n.children)) return true;
        }
        return false;
    };
    walk(clone);
    return clone;
}

export const useBuilderStore = create((set, get) => ({
    roots: [],
    theme: {},
    selectedIds: [],
    breakpoint: 'desktop',
    clipboard: null,
    past: [],
    future: [],
    isDirty: false,
    lastSavedAt: null,

    init: (schema) => {
        const roots = ensurePageStructure(schema.roots || []);
        set({
            roots,
            theme: mergeTheme(schema.theme || {}),
            selectedIds: [],
            past: [],
            future: [],
            isDirty: false,
        });
    },

    setTheme: (theme) => set((s) => ({ ...pushHistory(s), theme, isDirty: true })),

    select: (id, multi = false) => set((s) => {
        if (!id) return { selectedIds: [] };
        if (multi) {
            const has = s.selectedIds.includes(id);
            return { selectedIds: has ? s.selectedIds.filter((x) => x !== id) : [...s.selectedIds, id] };
        }
        return { selectedIds: [id] };
    }),

    setBreakpoint: (breakpoint) => set({ breakpoint }),

    updateNode: (nodeId, patch) => set((s) => ({
        ...pushHistory(s),
        roots: updateTree(s.roots, nodeId, (node) => ({ ...node, ...patch })),
        isDirty: true,
    })),

    updateNodeProps: (nodeId, props) => set((s) => ({
        ...pushHistory(s),
        roots: updateTree(s.roots, nodeId, (node) => ({ ...node, props: { ...node.props, ...props } })),
        isDirty: true,
    })),

    updateNodeStyle: (nodeId, breakpoint, stylePatch) => set((s) => ({
        ...pushHistory(s),
        roots: updateTree(s.roots, nodeId, (node) => ({
            ...node,
            style: {
                ...node.style,
                [breakpoint]: { ...(node.style?.[breakpoint] || {}), ...stylePatch },
            },
        })),
        isDirty: true,
    })),

    addComponentAt: (type, parentId, index) => {
        const node = createComponent(type);
        set((s) => ({
            ...pushHistory(s),
            roots: insertIntoTree(s.roots, parentId, node, index),
            selectedIds: [node.id],
            isDirty: true,
        }));
        return node.id;
    },

    addComponent: (type, parentId = null, index = -1) => {
        const state = get();
        let roots = ensurePageStructure(state.roots);
        const containerId = parentId || getPrimaryContainerId(roots);

        if (type === 'section') {
            const section = createComponent('section');
            const container = createComponent('container');
            section.children = [container];
            set((s) => ({
                ...pushHistory(s),
                roots: [...ensurePageStructure(s.roots), section],
                selectedIds: [section.id],
                isDirty: true,
            }));
            return section.id;
        }

        const node = createComponent(type);

        if (!containerId) {
            const section = createComponent('section');
            const container = createComponent('container');
            container.children = [node];
            section.children = [container];
            set((s) => ({
                ...pushHistory(s),
                roots: [section],
                selectedIds: [node.id],
                isDirty: true,
            }));
            return node.id;
        }

        const insertIndex = index >= 0 ? index : getCanvasBlocks(roots).length;
        set((s) => ({
            ...pushHistory(s),
            roots: insertIntoTree(ensurePageStructure(s.roots), containerId, node, insertIndex),
            selectedIds: [node.id],
            isDirty: true,
        }));
        return node.id;
    },

    reorderCanvasBlocks: (fromIndex, toIndex) => {
        const containerId = getPrimaryContainerId(get().roots);
        if (!containerId || fromIndex === toIndex) return;
        set((s) => ({
            ...pushHistory(s),
            roots: updateTree(s.roots, containerId, (node) => {
                const children = [...(node.children || [])];
                const [item] = children.splice(fromIndex, 1);
                children.splice(toIndex, 0, item);
                return { ...node, children };
            }),
            isDirty: true,
        }));
    },

    moveBlockBefore: (blockId, targetBlockId) => {
        const loc = findBlockLocation(get().roots, blockId);
        const targetLoc = findBlockLocation(get().roots, targetBlockId);
        if (!loc || !targetLoc || loc.parentId !== targetLoc.parentId) return;
        let toIndex = targetLoc.index;
        if (loc.index < toIndex) toIndex -= 1;
        get().moveNode(blockId, loc.parentId, toIndex);
    },

    removeNode: (nodeId) => set((s) => ({
        ...pushHistory(s),
        roots: removeFromTree(s.roots, nodeId),
        selectedIds: s.selectedIds.filter((id) => id !== nodeId),
        isDirty: true,
    })),

    duplicateNode: (nodeId) => {
        const node = findNode(get().roots, nodeId);
        if (!node) return;
        const copy = cloneNode(node);
        set((s) => {
            let parentId = null;
            let index = s.roots.length;
            walkNodes(s.roots, (n, i, arr, parent) => {
                if (n.id === nodeId) {
                    parentId = parent?.id ?? null;
                    index = i + 1;
                }
            });
            return {
                ...pushHistory(s),
                roots: insertIntoTree(s.roots, parentId, copy, index),
                selectedIds: [copy.id],
                isDirty: true,
            };
        });
    },

    moveNode: (nodeId, newParentId, newIndex) => set((s) => {
        const node = findNode(s.roots, nodeId);
        if (!node) return s;
        const copy = JSON.parse(JSON.stringify(node));
        let roots = removeFromTree(s.roots, nodeId);
        roots = insertIntoTree(roots, newParentId, copy, newIndex);
        return { ...pushHistory(s), roots, isDirty: true };
    }),

    reorderRoots: (fromIndex, toIndex) => set((s) => {
        const roots = [...s.roots];
        const [item] = roots.splice(fromIndex, 1);
        roots.splice(toIndex, 0, item);
        return { ...pushHistory(s), roots, isDirty: true };
    }),

    reorderChildren: (parentId, fromIndex, toIndex) => set((s) => ({
        ...pushHistory(s),
        roots: updateTree(s.roots, parentId, (node) => {
            const children = [...(node.children || [])];
            const [item] = children.splice(fromIndex, 1);
            children.splice(toIndex, 0, item);
            return { ...node, children };
        }),
        isDirty: true,
    })),

    copyNode: (nodeId) => {
        const node = findNode(get().roots, nodeId);
        if (node) set({ clipboard: cloneNode(node) });
    },

    pasteNode: (parentId = null) => {
        const { clipboard } = get();
        if (!clipboard) return;
        const copy = cloneNode(clipboard);
        const containerId = parentId ?? getPrimaryContainerId(get().roots);
        set((s) => ({
            ...pushHistory(s),
            roots: insertIntoTree(ensurePageStructure(s.roots), containerId, copy),
            selectedIds: [copy.id],
            isDirty: true,
        }));
    },

    importSchema: (schema) => set({
        ...pushHistory(get()),
        roots: ensurePageStructure(schema.roots || []),
        theme: mergeTheme(schema.theme || {}),
        selectedIds: [],
        isDirty: true,
    }),

    undo: () => set((s) => {
        if (!s.past.length) return s;
        const previous = s.past[s.past.length - 1];
        const current = snapshot(s);
        return {
            roots: previous.roots,
            theme: previous.theme,
            past: s.past.slice(0, -1),
            future: [current, ...s.future].slice(0, MAX_HISTORY),
            isDirty: true,
        };
    }),

    redo: () => set((s) => {
        if (!s.future.length) return s;
        const next = s.future[0];
        const current = snapshot(s);
        return {
            roots: next.roots,
            theme: next.theme,
            past: [...s.past, current].slice(-MAX_HISTORY),
            future: s.future.slice(1),
            isDirty: true,
        };
    }),

    getSchema: () => ({ version: 2, theme: mergeTheme(get().theme), roots: get().roots }),

    markSaved: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),
}));

export function useSelectedNode() {
    const roots = useBuilderStore((s) => s.roots);
    const selectedIds = useBuilderStore((s) => s.selectedIds);
    return selectedIds[0] ? findNode(roots, selectedIds[0]) : null;
}
