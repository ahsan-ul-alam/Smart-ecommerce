export const BLOCK_CATEGORIES = [
    {
        id: 'basic',
        label: 'Basic',
        types: ['heading', 'text', 'rich_text', 'list', 'quote', 'html', 'button', 'spacer', 'divider'],
    },
    {
        id: 'media',
        label: 'Media',
        types: ['image', 'gallery', 'video', 'banner'],
    },
    {
        id: 'layout',
        label: 'Layout',
        types: ['columns', 'icon_box', 'stats', 'features'],
    },
    {
        id: 'content',
        label: 'Content',
        types: ['testimonials', 'faq', 'cta'],
    },
    {
        id: 'commerce',
        label: 'Commerce',
        types: ['product', 'checkout'],
    },
];

export const BLOCK_LABELS = {
    heading: 'Heading',
    text: 'Text',
    rich_text: 'Rich text (HTML)',
    list: 'List',
    quote: 'Quote',
    html: 'Custom HTML',
    button: 'Button',
    spacer: 'Spacer',
    divider: 'Divider',
    image: 'Image',
    gallery: 'Gallery',
    video: 'Video',
    banner: 'Banner',
    columns: 'Columns',
    icon_box: 'Icon box',
    stats: 'Stats',
    features: 'Features',
    testimonials: 'Testimonials',
    faq: 'FAQ',
    cta: 'Call to action',
    product: 'Product card',
    checkout: 'Order form',
};

export const defaultBlockStyle = () => ({
    align: 'left',
    width: 'full',
    paddingY: 'normal',
    background: '',
    textColor: '',
});

export function newBlockId() {
    return `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlock(type) {
    const base = { id: newBlockId(), type, style: defaultBlockStyle() };

    switch (type) {
        case 'heading':
            return { ...base, text: 'Your headline', level: 2, align: 'left' };
        case 'text':
            return { ...base, title: 'Section title', body: 'Write your content here.' };
        case 'rich_text':
            return { ...base, html: '<p>Add <strong>formatted</strong> content with HTML.</p>' };
        case 'list':
            return { ...base, title: '', ordered: false, items: ['First point', 'Second point', 'Third point'] };
        case 'quote':
            return { ...base, text: 'A memorable quote from a customer.', author: 'Customer name' };
        case 'html':
            return { ...base, html: '<div class="text-center"><p>Custom embed or markup</p></div>' };
        case 'button':
            return { ...base, text: 'Learn more', url: '#checkout', variant: 'primary', size: 'md', newTab: false };
        case 'spacer':
            return { ...base, height: 48 };
        case 'divider':
            return { ...base, variant: 'line' };
        case 'image':
            return { ...base, src: '', alt: '', caption: '', link: '', width: 'full' };
        case 'gallery':
            return { ...base, title: '', images: [{ src: '', alt: '' }, { src: '', alt: '' }] };
        case 'video':
            return { ...base, url: '', caption: '' };
        case 'banner':
            return { ...base, src: '', title: 'Banner title', subtitle: 'Supporting text', button: 'Order now', buttonUrl: '#checkout', overlay: 'dark' };
        case 'columns':
            return {
                ...base,
                columns: 2,
                gap: 'md',
                cols: [
                    { blocks: [createBlock('text')] },
                    { blocks: [createBlock('text')] },
                ],
            };
        case 'icon_box':
            return { ...base, icon: '✓', title: 'Fast delivery', body: 'Nationwide shipping', link: '' };
        case 'stats':
            return { ...base, items: [{ value: '24h', label: 'Fast delivery' }, { value: '100%', label: 'Authentic' }] };
        case 'features':
            return { ...base, title: 'Features', items: ['Official warranty', 'Secure payment', 'Easy returns'] };
        case 'testimonials':
            return { ...base, title: 'Reviews', items: [{ name: 'Customer', text: 'Great product!', rating: 5 }] };
        case 'faq':
            return { ...base, title: 'FAQ', items: [{ q: 'Delivery time?', a: '2-5 business days.' }] };
        case 'cta':
            return { ...base, title: 'Order today', body: 'Limited stock', button: 'Buy now' };
        case 'product':
            return { ...base };
        case 'checkout':
            return { ...base, title: 'Place your order', subtitle: 'Delivery & payment on this page' };
        default:
            return { ...base, type: 'text', title: '', body: '' };
    }
}

export function ensureBlockIds(blocks) {
    if (!Array.isArray(blocks)) return [];

    return blocks.map((block) => {
        const next = { ...block, id: block.id || newBlockId() };
        if (next.type === 'columns' && Array.isArray(next.cols)) {
            next.cols = next.cols.map((col) => ({
                ...col,
                blocks: ensureBlockIds(col.blocks || []),
            }));
        }
        if (!next.style) {
            next.style = defaultBlockStyle();
        }
        return next;
    });
}

export function walkBlocks(blocks, visitor) {
    blocks.forEach((block, index) => {
        visitor(block, index, blocks);
        if (block.type === 'columns' && block.cols) {
            block.cols.forEach((col, colIndex) => {
                walkBlocks(col.blocks || [], (b, i, arr) => visitor(b, i, arr, block, colIndex));
            });
        }
    });
}

export function collectPendingMedia(blocks, pending = {}) {
    walkBlocks(blocks, (block) => {
        if (block._pendingFile && block.id) {
            pending[block.id] = block._pendingFile;
        }
        if (block.type === 'gallery' && block._pendingFiles?.length && block.id) {
            pending[block.id] = block._pendingFiles;
        }
    });
    return pending;
}

export function stripBlockMeta(blocks) {
    return blocks.map((block) => {
        const { _pendingFile, _pendingFiles, src_display, ...rest } = block;
        const clean = { ...rest };
        if (clean.type === 'columns' && clean.cols) {
            clean.cols = clean.cols.map((col) => ({
                ...col,
                blocks: stripBlockMeta(col.blocks || []),
            }));
        }
        if (clean.type === 'gallery' && clean.images) {
            clean.images = clean.images.filter((img) => img.src);
        }
        return clean;
    });
}
