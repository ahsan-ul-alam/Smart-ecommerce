import { createNode, createSection, newId, defaultStyle, defaultAnimation } from './defaults';
import { mergeTheme } from './themeTokens';
import { kafelaMartTemplate } from './templatePresets';

const BLOCK_MAP = {
    heading: () => createNode('heading', { text: 'Heading', level: 2 }),
    text: () => createNode('text', { title: '', body: 'Your content here.' }),
    rich_text: () => createNode('rich_text', { html: '<p>Rich text content</p>' }),
    button: () => createNode('button', { text: 'Click me', url: '#checkout', variant: 'primary' }),
    image: () => createNode('image', { src: '', alt: '', width: 'full' }),
    video: () => createNode('video', { url: '' }),
    divider: () => createNode('divider', { variant: 'line' }),
    spacer: () => createNode('spacer', { height: 48 }),
    icon: () => createNode('icon', { icon: '⭐', size: 32 }),
    stats: () => createNode('stats', { items: [{ value: '100%', label: 'Quality' }] }),
    features: () => createNode('features', { title: 'Features', items: ['Fast delivery'] }),
    testimonials: () => createNode('testimonials', { title: 'Reviews', items: [] }),
    faq: () => createNode('faq', { title: 'FAQ', items: [] }),
    cta: () => createNode('cta', { title: 'Order now', body: '', button: 'Buy' }),
    checkout: () => createNode('checkout', { title: 'Place order', subtitle: '' }),
    product: () => createNode('product', {}),
    hero_banner: () => createNode('hero_banner', { title: 'Hero', subtitle: '', button: 'Shop' }),
    product_grid: () => createNode('product_grid', { dataSource: { type: 'featured', limit: 8 }, columns: 4 }),
    product_carousel: () => createNode('product_carousel', { dataSource: { type: 'featured', limit: 12 } }),
    category_grid: () => createNode('category_grid', { limit: 6 }),
    countdown: () => createNode('countdown', { targetDate: '', label: 'Sale ends in' }),
    newsletter: () => createNode('newsletter', { title: 'Subscribe', placeholder: 'Your email' }),
    pricing_table: () => createNode('pricing_table', { plans: [{ name: 'Basic', price: '৳999', features: ['Feature 1'] }] }),
    gallery: () => createNode('gallery', { images: [] }),
    tabs: () => createNode('tabs', { items: [{ label: 'Tab 1', content: 'Content' }] }),
    accordion: () => createNode('accordion', { items: [{ title: 'Item 1', content: 'Details' }] }),
    slider: () => createNode('slider', { slides: [{ title: 'Slide 1', image: '' }] }),
    carousel: () => createNode('carousel', { slides: [{ image: '', caption: '' }] }),
};

export function blocksToSchema(blocks = [], theme = {}) {
    if (!blocks.length) {
        return { version: 2, theme, roots: [] };
    }

    const section = createSection();
    const container = section.children[0];

    container.children = blocks.map((block) => {
        const factory = BLOCK_MAP[block.type];
        if (factory) {
            const node = factory();
            node.props = { ...node.props, ...legacyProps(block) };
            return node;
        }
        return createNode('text', { body: JSON.stringify(block) });
    });

    return { version: 2, theme, roots: [section] };
}

function legacyProps(block) {
    const { type, id, style, ...props } = block;
    return props;
}

export function normalizeSchema(schema, theme = {}) {
    if (schema?.roots?.length) {
        return { version: 2, theme: mergeTheme({ ...theme, ...schema.theme }), roots: schema.roots };
    }
    if (schema?.blocks?.length) {
        return blocksToSchema(schema.blocks, theme);
    }
    return kafelaMartTemplate();
}

export function ensureNodeIds(nodes) {
    walk(nodes);
    return nodes;
}

function walk(nodes) {
    nodes.forEach((node) => {
        if (!node.id) node.id = newId(node.type);
        if (!node.style) node.style = defaultStyle();
        if (!node.animation) node.animation = defaultAnimation();
        if (node.children) walk(node.children);
    });
}
