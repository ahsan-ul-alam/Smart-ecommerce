import { createDefaultSchema, emptySchema } from './defaults';
import { createComponent } from '../registry/components';

export const PAGE_TEMPLATES = [
    { id: 'blank', label: 'Blank page', description: 'Start from scratch', build: () => emptySchema() },
    { id: 'product_launch', label: 'Product Launch', description: 'Hero, stats, products, FAQ, checkout', build: () => createDefaultSchema() },
    { id: 'flash_sale', label: 'Flash Sale', description: 'Countdown + flash products', build: flashSaleTemplate },
    { id: 'eid_campaign', label: 'Eid Campaign', description: 'Festive hero + categories', build: eidTemplate },
    { id: 'lead_gen', label: 'Lead Generation', description: 'Hero + newsletter + CTA', build: leadGenTemplate },
    { id: 'fashion_store', label: 'Fashion Store', description: 'Product carousel + grid', build: fashionTemplate },
    { id: 'electronics', label: 'Electronics Store', description: 'Features + product grid', build: electronicsTemplate },
];

function flashSaleTemplate() {
    const schema = createDefaultSchema();
    const container = schema.roots[0].children[0];
    container.children.unshift(
        createComponent('countdown'),
        createComponent('flash_sale_products'),
    );
    return schema;
}

function eidTemplate() {
    const schema = createDefaultSchema();
    const children = schema.roots[0].children[0].children;
    children[0] = createComponent('hero_banner');
    children[0].props = { title: 'Eid Collection', subtitle: 'Celebrate with exclusive deals', button: 'Shop Eid offers', buttonUrl: '#checkout' };
    children.splice(2, 0, createComponent('category_grid'));
    return schema;
}

function leadGenTemplate() {
    const section = createComponent('section');
    const container = createComponent('container');
    container.children = [
        createComponent('hero_banner'),
        createComponent('newsletter'),
        createComponent('cta'),
    ];
    section.children = [container];
    return { version: 2, theme: {}, roots: [section] };
}

function fashionTemplate() {
    const schema = createDefaultSchema();
    schema.roots[0].children[0].children.splice(2, 0, createComponent('product_carousel'));
    return schema;
}

function electronicsTemplate() {
    const schema = createDefaultSchema();
    schema.roots[0].children[0].children.splice(2, 0,
        createComponent('features'),
        createComponent('product_grid'),
    );
    return schema;
}

export function importTemplate(templateId, theme = {}) {
    const tpl = PAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return createDefaultSchema(theme);
    const schema = tpl.build();
    schema.theme = { ...theme, ...schema.theme };
    return schema;
}
