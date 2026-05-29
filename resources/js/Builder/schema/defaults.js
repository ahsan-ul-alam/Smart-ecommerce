import { kafelaMartTemplate } from './templatePresets';

export const BREAKPOINTS = ['desktop', 'tablet', 'mobile'];

export const DEVICE_WIDTH = { desktop: '100%', tablet: '768px', mobile: '390px' };

export function newId(prefix = 'node') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultStyle() {
    return {
        desktop: {},
        tablet: {},
        mobile: {},
    };
}

export function defaultAnimation() {
    return { type: 'none', duration: 400, delay: 0, trigger: 'onView' };
}

export function createNode(type, props = {}) {
    return {
        id: newId(type),
        type,
        props: { ...props },
        style: defaultStyle(),
        animation: defaultAnimation(),
        children: isLayoutType(type) ? [] : undefined,
    };
}

export function isLayoutType(type) {
    return ['section', 'container', 'grid', 'columns', 'flex', 'tabs', 'accordion', 'slider', 'carousel'].includes(type);
}

export function createSection(children = []) {
    const section = createNode('section', { fullWidth: true });
    if (children.length) {
        section.children = children;
    } else {
        const container = createNode('container', { maxWidth: 'xl' });
        section.children = [container];
    }
    return section;
}

export function createDefaultSchema() {
    return kafelaMartTemplate();
}

export function productLaunchSection() {
    const section = createSection();
    const container = section.children[0];
    container.children = [
        createNode('hero_banner', {
            title: 'Exclusive Launch Offer',
            subtitle: 'Limited stock — order today with fast delivery',
            button: 'Order now',
            buttonUrl: '#checkout',
        }),
        createNode('stats', {
            items: [
                { value: '24h', label: 'Fast processing' },
                { value: '100%', label: 'Authentic' },
                { value: 'COD', label: 'Cash on delivery' },
            ],
        }),
        createNode('product_grid', { dataSource: { type: 'featured', limit: 4 }, columns: 4 }),
        createNode('testimonials', {
            title: 'Customer reviews',
            items: [{ name: 'Customer', text: 'Great product!', rating: 5 }],
        }),
        createNode('faq', {
            title: 'FAQ',
            items: [{ q: 'Delivery time?', a: '2–5 business days.' }],
        }),
        createNode('checkout', { title: 'Place your order', subtitle: 'Complete on this page' }),
    ];
    return section;
}

export function emptySchema(theme = {}) {
    return { version: 2, theme, roots: [] };
}

export function resolveStyle(node, breakpoint = 'desktop') {
    const base = node?.style?.desktop || {};
    const tablet = node?.style?.tablet || {};
    const mobile = node?.style?.mobile || {};

    if (breakpoint === 'mobile') {
        return { ...base, ...tablet, ...mobile };
    }
    if (breakpoint === 'tablet') {
        return { ...base, ...tablet };
    }
    return base;
}

export function styleToCss(style = {}) {
    const css = {};
    if (style.margin) css.margin = style.margin;
    if (style.padding) css.padding = style.padding;
    if (style.width) css.width = style.width;
    if (style.height) css.height = style.height;
    if (style.minHeight) css.minHeight = style.minHeight;
    if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
    if (style.backgroundGradient) css.background = style.backgroundGradient;
    if (style.color) css.color = style.color;
    if (style.fontSize) css.fontSize = style.fontSize;
    if (style.fontWeight) css.fontWeight = style.fontWeight;
    if (style.lineHeight) css.lineHeight = style.lineHeight;
    if (style.textAlign) css.textAlign = style.textAlign;
    if (style.borderRadius) css.borderRadius = style.borderRadius;
    if (style.border) css.border = style.border;
    if (style.boxShadow) css.boxShadow = style.boxShadow;
    if (style.opacity != null) css.opacity = style.opacity;
    if (style.zIndex != null) css.zIndex = style.zIndex;
    if (style.display === 'none') css.display = 'none';
    return css;
}

export function walkNodes(nodes, visitor, parent = null) {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((node, index) => {
        visitor(node, index, nodes, parent);
        if (node.children?.length) {
            walkNodes(node.children, visitor, node);
        }
    });
}

export function findNode(nodes, id) {
    let found = null;
    walkNodes(nodes, (node) => {
        if (node.id === id) found = node;
    });
    return found;
}

export function cloneNode(node) {
    const copy = JSON.parse(JSON.stringify(node));
    const reId = (n) => {
        n.id = newId(n.type);
        if (n.children) n.children.forEach(reId);
    };
    reId(copy);
    return copy;
}

export function collectMediaFiles(nodes, pending = {}) {
    walkNodes(nodes, (node) => {
        if (node._pendingFile && node.id) pending[node.id] = node._pendingFile;
        if (node._pendingFiles?.length && node.id) pending[node.id] = node._pendingFiles;
    });
    return pending;
}

export function stripEditorMeta(nodes) {
    return nodes.map((node) => {
        const { _pendingFile, _pendingFiles, ...rest } = node;
        const clean = { ...rest };
        if (clean.children) clean.children = stripEditorMeta(clean.children);
        return clean;
    });
}
