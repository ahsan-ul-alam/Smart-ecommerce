import { create } from 'zustand';
import { cloneNode, findNode, walkNodes } from '../schema/defaults';
import { createComponent, LAYOUT_TYPES } from '../registry/components';

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

    init: (schema) => set({
        roots: schema.roots || [],
        theme: schema.theme || {},
        selectedIds: [],
        past: [],
        future: [],
        isDirty: false,
    }),

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

    addComponent: (type, parentId = null, index = -1) => {
        const resolved = type === 'section' ? createComponent('section') : createComponent(type);
        const state = get();

        const wrapInPage = (node) => {
            const section = createComponent('section');
            const container = createComponent('container');
            container.children = [node];
            section.children = [container];
            return section;
        };

        if (type === 'section' && !parentId) {
            set((s) => ({
                ...pushHistory(s),
                roots: [...s.roots, resolved],
                selectedIds: [resolved.id],
                isDirty: true,
            }));
            return resolved.id;
        }

        let targetParent = parentId;
        if (!targetParent) {
            targetParent = state.findDropTarget(type);
        }

        if (!targetParent && state.roots.length === 0 && !LAYOUT_TYPES.includes(resolved.type)) {
            const wrapped = wrapInPage(resolved);
            set((s) => ({
                ...pushHistory(s),
                roots: [wrapped],
                selectedIds: [resolved.id],
                isDirty: true,
            }));
            return resolved.id;
        }

        if (!targetParent && LAYOUT_TYPES.includes(resolved.type)) {
            set((s) => ({
                ...pushHistory(s),
                roots: [...s.roots, resolved],
                selectedIds: [resolved.id],
                isDirty: true,
            }));
            return resolved.id;
        }

        set((s) => ({
            ...pushHistory(s),
            roots: insertIntoTree(s.roots, targetParent, resolved, index),
            selectedIds: [resolved.id],
            isDirty: true,
        }));
        return resolved.id;
    },

    findDropTarget: (type) => {
        const { roots, selectedIds } = get();
        const selected = selectedIds[0] ? findNode(roots, selectedIds[0]) : null;
        if (selected && LAYOUT_TYPES.includes(selected.type)) return selected.id;
        if (LAYOUT_TYPES.includes(type)) return null;
        const section = roots[roots.length - 1];
        if (section?.children?.[0]) return section.children[0].id;
        return null;
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
        set((s) => ({
            ...pushHistory(s),
            roots: insertIntoTree(s.roots, parentId ?? s.findDropTarget(copy.type), copy),
            selectedIds: [copy.id],
            isDirty: true,
        }));
    },

    importSchema: (schema) => set({
        ...pushHistory(get()),
        roots: schema.roots || [],
        theme: schema.theme || get().theme,
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

    getSchema: () => ({ version: 2, theme: get().theme, roots: get().roots }),

    markSaved: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),
}));

export function useSelectedNode() {
    const roots = useBuilderStore((s) => s.roots);
    const selectedIds = useBuilderStore((s) => s.selectedIds);
    return selectedIds[0] ? findNode(roots, selectedIds[0]) : null;
}
