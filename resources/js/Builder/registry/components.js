export const COMPONENT_CATEGORIES = [
    {
        id: 'basic',
        label: 'Basic',
        items: ['heading', 'text', 'paragraph', 'button', 'image', 'video', 'divider', 'spacer', 'icon', 'html'],
    },
    {
        id: 'layout',
        label: 'Layout',
        items: ['section', 'container', 'grid', 'columns', 'flex'],
    },
    {
        id: 'commerce',
        label: 'Commerce',
        items: ['product_grid', 'product_carousel', 'featured_products', 'flash_sale_products', 'category_grid', 'category_slider', 'product', 'checkout'],
    },
    {
        id: 'marketing',
        label: 'Marketing',
        items: ['hero_banner', 'countdown', 'cta', 'newsletter', 'testimonials', 'faq', 'pricing_table', 'stats', 'features'],
    },
    {
        id: 'advanced',
        label: 'Advanced',
        items: ['tabs', 'accordion', 'gallery', 'slider', 'carousel'],
    },
];

export const COMPONENT_LABELS = {
    heading: 'Heading',
    text: 'Text block',
    paragraph: 'Paragraph',
    button: 'Button',
    image: 'Image',
    video: 'Video',
    divider: 'Divider',
    spacer: 'Spacer',
    icon: 'Icon',
    html: 'Custom HTML',
    section: 'Section',
    container: 'Container',
    grid: 'Grid',
    columns: 'Columns',
    flex: 'Flex row',
    product_grid: 'Product grid',
    product_carousel: 'Product carousel',
    featured_products: 'Featured products',
    flash_sale_products: 'Flash sale',
    category_grid: 'Category grid',
    category_slider: 'Category slider',
    product: 'Product card',
    checkout: 'Order form',
    hero_banner: 'Hero banner',
    countdown: 'Countdown',
    cta: 'Call to action',
    newsletter: 'Newsletter',
    testimonials: 'Testimonials',
    faq: 'FAQ',
    pricing_table: 'Pricing table',
    stats: 'Statistics',
    features: 'Features',
    tabs: 'Tabs',
    accordion: 'Accordion',
    gallery: 'Gallery',
    slider: 'Slider',
    carousel: 'Carousel',
};

export const LAYOUT_TYPES = ['section', 'container', 'grid', 'columns', 'flex', 'tabs', 'accordion', 'slider', 'carousel'];

export const DATA_SOURCE_TYPES = [
    { value: 'featured', label: 'Featured products' },
    { value: 'new', label: 'New arrivals' },
    { value: 'trending', label: 'Trending' },
    { value: 'best_selling', label: 'Best selling' },
    { value: 'flash_sale', label: 'Flash sale products' },
    { value: 'category', label: 'By category' },
    { value: 'manual', label: 'Manual selection' },
];

export function getDefaultProps(type) {
    const map = {
        heading: { text: 'Heading', level: 2 },
        text: { title: '', body: 'Text content' },
        paragraph: { text: 'Paragraph text goes here.' },
        button: { text: 'Button', url: '#checkout', variant: 'primary', size: 'md' },
        image: { src: '', alt: '', width: 'full' },
        video: { url: '', caption: '' },
        divider: { variant: 'line' },
        spacer: { height: 40 },
        icon: { icon: '✓', size: 28 },
        html: { html: '<p>Custom HTML</p>' },
        section: { fullWidth: true, paddingY: 'lg' },
        container: { maxWidth: 'xl' },
        grid: { columns: 3, gap: 'md' },
        columns: { count: 2, gap: 'md' },
        flex: { direction: 'row', gap: 'md', align: 'center', wrap: true },
        product_grid: { dataSource: { type: 'featured', limit: 8 }, columns: 4 },
        product_carousel: { dataSource: { type: 'featured', limit: 12 } },
        featured_products: { dataSource: { type: 'featured', limit: 8 }, columns: 4 },
        flash_sale_products: { dataSource: { type: 'flash_sale', limit: 8 }, columns: 4 },
        category_grid: { limit: 6 },
        category_slider: { limit: 8 },
        product: {},
        checkout: { title: 'Place your order', subtitle: '' },
        hero_banner: { title: 'Hero title', subtitle: '', button: 'Shop now', buttonUrl: '#checkout', overlay: 'dark' },
        countdown: { targetDate: '', label: 'Offer ends in' },
        cta: { title: 'CTA title', body: '', button: 'Order now' },
        newsletter: { title: 'Newsletter', placeholder: 'Email' },
        testimonials: { title: 'Reviews', items: [] },
        faq: { title: 'FAQ', items: [] },
        pricing_table: { plans: [] },
        stats: { items: [] },
        features: { title: 'Features', items: [] },
        tabs: { items: [{ label: 'Tab 1', content: 'Content' }] },
        accordion: { items: [{ title: 'Item', content: 'Details' }] },
        gallery: { images: [] },
        slider: { slides: [] },
        carousel: { slides: [] },
    };
    return map[type] || {};
}

export function createComponent(type) {
    const resolved = resolveComponentType(type);
    return {
        id: `cmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        type: resolved,
        props: { ...getDefaultProps(type), ...(type !== resolved ? getDefaultProps(resolved) : {}) },
        style: { desktop: {}, tablet: {}, mobile: {} },
        animation: { type: 'none', duration: 400, delay: 0, trigger: 'onView' },
        children: LAYOUT_TYPES.includes(resolved) ? [] : undefined,
    };
}

export function resolveComponentType(type) {
    if (type === 'paragraph') return 'text';
    if (type === 'featured_products') return 'product_grid';
    if (type === 'flash_sale_products') return 'product_grid';
    if (type === 'category_slider') return 'category_grid';
    return type;
}
