import { createComponent } from '../registry/components';
import { LAYOUT_TYPES } from '../registry/components';

/** Returns the main content container (section > container) used for block ordering. */
export function getPrimaryContainer(roots) {
    if (!roots?.length) return null;
    for (const section of roots) {
        const container = section.children?.find((c) => c.type === 'container');
        if (container) return container;
    }
    return roots[0]?.children?.[0] ?? null;
}

export function getPrimaryContainerId(roots) {
    return getPrimaryContainer(roots)?.id ?? null;
}

export function getCanvasBlocks(roots) {
    return getPrimaryContainer(roots)?.children ?? [];
}

export function ensurePageStructure(roots) {
    if (roots?.length && getPrimaryContainer(roots)) {
        return roots;
    }
    const section = createComponent('section');
    const container = createComponent('container');
    section.children = [container];
    return [section];
}

export function findBlockLocation(roots, blockId) {
    let result = null;
    const walk = (nodes, parent = null) => {
        nodes.forEach((node, index) => {
            if (node.id === blockId) {
                result = { parentId: parent?.id ?? null, index, node };
            }
            if (node.children) walk(node.children, node);
        });
    };
    walk(roots);
    return result;
}

export function parseInsertDropId(id) {
    if (typeof id !== 'string' || !id.startsWith('insert-')) return null;
    const index = Number(id.replace('insert-', ''));
    return Number.isFinite(index) ? { index } : null;
}

export function isLayoutOnly(type) {
    return LAYOUT_TYPES.includes(type) && !['container'].includes(type);
}
