import { memo, useMemo, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { resolveStyle, styleToCss } from '../schema/defaults';
import { migrateLegacyLayout } from '../schema/migrate';
import { themeToCssVars, builderSelectionClass } from '../schema/themeTokens';
import { mediaUrl } from '../../utils/mediaUrl';
import ProductCard from '../../Components/Shop/ProductCard';
import ProductThumbnail from '../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../Components/Catalog/ProductPrice';
import OfferCheckoutForm from '../../Components/SpecialProduct/OfferCheckoutForm';

const MAX_WIDTH = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', full: '100%' };

function resolveContainerMaxWidth(containerProp, pageMaxWidth = 'xl') {
    const key = containerProp || pageMaxWidth || 'xl';
    return MAX_WIDTH[key] || MAX_WIDTH.xl;
}

function animationClass(animation) {
    if (!animation || animation.type === 'none') return '';
    return `builder-anim builder-anim-${animation.type}`;
}

const NodeRenderer = memo(function NodeRenderer({
    node, breakpoint, catalog, product, checkout, onAction, editorMode, builderPreview = false, contentMaxWidth = 'xl', selectedIds, onSelect,
}) {
    const style = resolveStyle(node, breakpoint);
    if (style.display === 'none') return null;

    const css = styleToCss(style);
    const anim = animationClass(node.animation);
    const selected = selectedIds?.includes(node.id);
    const wrap = (content, className = '') => {
        if (editorMode) {
            return (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onSelect?.(node.id, e.shiftKey); }}
                    className={`${className} ${selected ? builderSelectionClass() : ''} ${editorMode ? 'cursor-pointer' : ''} ${anim}`}
                    style={css}
                    data-node-id={node.id}
                    data-node-type={node.type}
                >
                    {content}
                </div>
            );
        }
        return <div className={`${className} ${anim}`} style={css}>{content}</div>;
    };

    const childCtx = { catalog, product, checkout, onAction, breakpoint, NodeRenderer, editorMode, builderPreview, contentMaxWidth, selectedIds, onSelect };
    const content = renderContent(node, childCtx);
    if (content === null && !node.children?.length) return null;

    if (['section', 'container', 'grid', 'columns', 'flex'].includes(node.type)) {
        return wrap(renderLayout(node, content, { NodeRenderer, ...childCtx }), layoutClass(node));
    }

    return wrap(content);
});

function renderLayout(node, _, ctx) {
    const { NodeRenderer, contentMaxWidth, ...childCtx } = ctx;
    const children = (node.children || []).map((child) => (
        <NodeRenderer key={child.id} node={child} contentMaxWidth={contentMaxWidth} {...childCtx} />
    ));

    switch (node.type) {
        case 'section':
            return <section className="w-full">{children}</section>;
        case 'container':
            return (
                <div
                    className="mx-auto w-full"
                    style={{ maxWidth: resolveContainerMaxWidth(node.props?.maxWidth, contentMaxWidth) }}
                >
                    {children}
                </div>
            );
        case 'grid': {
            const cols = node.props?.columns || 3;
            const grid = cols >= 4 ? 'grid-cols-2 sm:grid-cols-4' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3';
            return <div className={`grid ${grid} gap-4 sm:gap-6`}>{children}</div>;
        }
        case 'columns': {
            const count = node.props?.count || 2;
            const grid = count >= 4 ? 'sm:grid-cols-4' : count === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
            return <div className={`grid grid-cols-1 ${grid} gap-6`}>{children}</div>;
        }
        case 'flex':
            return (
                <div className={`flex ${node.props?.wrap ? 'flex-wrap' : ''} gap-4 items-${node.props?.align || 'center'}`} style={{ flexDirection: node.props?.direction || 'row' }}>
                    {children}
                </div>
            );
        default:
            return children;
    }
}

function layoutClass(node) {
    return node.type === 'section' ? 'w-full' : '';
}

function renderContent(node, ctx) {
    const { catalog, product, checkout, onAction } = ctx;
    const p = node.props || {};

    switch (node.type) {
        case 'heading': {
            const Tag = `h${Math.min(6, Math.max(1, p.level || 2))}`;
            return <Tag className="font-bold text-[var(--offer-text)]">{p.text}</Tag>;
        }
        case 'text':
            return (
                <div>
                    {p.title && <h2 className="text-2xl font-bold mb-2">{p.title}</h2>}
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">{p.body || p.text}</p>
                </div>
            );
        case 'rich_text':
        case 'html':
            return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: p.html || '' }} />;
        case 'button':
            return (
                <button type="button" onClick={() => onAction?.(p.url)} className={`px-6 py-3 rounded-xl font-bold ${p.variant === 'outline' ? 'border-2 border-[var(--offer-primary)] text-[var(--offer-primary)] bg-transparent' : p.variant === 'secondary' ? 'bg-[var(--offer-secondary)] text-white' : 'bg-[var(--offer-primary)] text-white'}`}>
                    {p.text}
                </button>
            );
        case 'image':
            return p.src ? <img src={mediaUrl(p.src)} alt={p.alt || ''} className="rounded-xl w-full max-w-full" /> : editorPlaceholder('Image');
        case 'video':
            return <VideoEmbed url={p.url} caption={p.caption} />;
        case 'divider':
            return p.variant === 'dots' ? <p className="text-center text-slate-300">• • •</p> : <hr className="border-slate-200" />;
        case 'spacer':
            return <div style={{ height: p.height || 32 }} />;
        case 'icon':
            return <span style={{ fontSize: p.size || 28 }}>{p.icon}</span>;
        case 'hero_banner':
            return <HeroBanner props={p} onAction={onAction} />;
        case 'stats':
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(p.items || []).map((it, i) => (
                        <div key={i} className="text-center p-4 rounded-2xl border shadow-sm bg-[var(--offer-primary-light)] border-[var(--offer-primary)]/15">
                            <p className="text-2xl font-bold text-[var(--offer-primary)]">{it.value}</p>
                            <p className="text-xs opacity-70">{it.label}</p>
                        </div>
                    ))}
                </div>
            );
        case 'features':
            return (
                <div>
                    {p.title && <h2 className="text-2xl font-bold mb-4">{p.title}</h2>}
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {(p.items || []).map((item, i) => (
                            <li key={i} className="flex gap-2 p-3 rounded-xl bg-white border text-sm"><span className="text-[var(--offer-primary)]">✓</span>{item}</li>
                        ))}
                    </ul>
                </div>
            );
        case 'testimonials':
            return (
                <div>
                    {p.title && <h2 className="text-2xl font-bold mb-4">{p.title}</h2>}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {(p.items || []).map((t, i) => (
                            <blockquote key={i} className="p-4 rounded-2xl bg-white border">
                                <p className="text-[var(--offer-secondary)] text-sm">{'★'.repeat(t.rating || 5)}</p>
                                <p className="text-sm italic text-slate-600 mt-1">&ldquo;{t.text}&rdquo;</p>
                                <p className="text-xs font-semibold mt-2">— {t.name}</p>
                            </blockquote>
                        ))}
                    </div>
                </div>
            );
        case 'faq':
            return <FaqBlock items={p.items} title={p.title} />;
        case 'cta':
            return (
                <div className="text-center py-8 px-6 rounded-3xl text-white" style={{ background: 'linear-gradient(135deg, var(--offer-primary) 0%, var(--offer-primary-dark) 100%)' }}>
                    <h2 className="text-2xl font-bold mb-2">{p.title}</h2>
                    <p className="mb-6 opacity-90">{p.body}</p>
                    <button type="button" onClick={() => onAction?.('#checkout')} className="px-8 py-3 rounded-xl bg-white text-[var(--offer-primary)] font-bold">{p.button}</button>
                </div>
            );
        case 'countdown':
            return <CountdownBlock targetDate={p.targetDate} label={p.label} />;
        case 'newsletter':
            return (
                <div className="p-6 rounded-2xl bg-white border text-center">
                    <h3 className="font-bold text-lg">{p.title}</h3>
                    <div className="mt-4 flex gap-2 max-w-md mx-auto">
                        <input type="email" placeholder={p.placeholder || 'Email'} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                        <button type="button" className="px-4 py-2 rounded-lg bg-[var(--offer-primary)] text-white text-sm font-semibold">Subscribe</button>
                    </div>
                </div>
            );
        case 'pricing_table':
            return (
                <div className="grid sm:grid-cols-3 gap-4">
                    {(p.plans || []).map((plan, i) => (
                        <div key={i} className="p-6 rounded-2xl border bg-white text-center">
                            <h3 className="font-bold">{plan.name}</h3>
                            <p className="text-2xl font-bold text-[var(--offer-primary)] my-2">{plan.price}</p>
                            <ul className="text-sm text-slate-600 space-y-1">{(plan.features || []).map((f, j) => <li key={j}>{f}</li>)}</ul>
                        </div>
                    ))}
                </div>
            );
        case 'product_grid':
            return <ProductGrid props={p} catalog={catalog} columns={p.columns || 4} />;
        case 'product_carousel':
            return <ProductCarouselBlock props={p} catalog={catalog} />;
        case 'category_grid':
            return <CategoryGrid catalog={catalog} limit={p.limit || 6} />;
        case 'product':
            return product ? (
                <div className="grid sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-white border">
                    <ProductThumbnail product={product} className="aspect-square rounded-xl" size="lg" />
                    <div>
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <ProductPrice product={product} className="text-2xl font-bold text-[var(--offer-primary)] mt-2" />
                    </div>
                </div>
            ) : null;
        case 'checkout':
            return checkout ? (
                <div className="w-full overflow-visible">
                    <OfferCheckoutForm
                        {...checkout}
                        title={p.title}
                        subtitle={p.subtitle}
                        supportPhone={p.supportPhone}
                        supportHours={p.supportHours}
                    />
                </div>
            ) : editorPlaceholder('Checkout form');
        case 'tabs':
            return <TabsBlock items={p.items} />;
        case 'accordion':
            return <AccordionBlock items={p.items} />;
        case 'gallery':
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(p.images || []).filter((img) => img.src).map((img, i) => (
                        <img key={i} src={mediaUrl(img.src)} alt={img.alt || ''} className="rounded-xl aspect-square object-cover w-full" />
                    ))}
                </div>
            );
        default:
            return editorPlaceholder(node.type);
    }
}

function resolveProducts(props, catalog) {
    const ds = props?.dataSource || { type: 'featured', limit: 8 };
    const limit = ds.limit || 8;
    let list = catalog?.products || [];
    if (ds.type === 'flash_sale' && catalog?.flashProducts?.length) list = catalog.flashProducts;
    return Array.isArray(list) ? list.slice(0, limit) : [];
}

function ProductGrid({ props, catalog, columns }) {
    const products = resolveProducts(props, catalog);
    const grid = columns >= 4 ? 'grid-cols-2 sm:grid-cols-4' : columns === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';
    return (
        <div>
            {props.title && <h2 className="text-2xl font-bold mb-4">{props.title}</h2>}
            <div className={`grid ${grid} gap-4`}>
                {products.map((p) => <ProductCard key={p.id} product={p} compact catalog />)}
            </div>
        </div>
    );
}

function ProductCarouselBlock({ props, catalog }) {
    const products = resolveProducts(props, catalog);
    return (
        <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{ minWidth: 'min-content' }}>
                {products.map((p) => (
                    <div key={p.id} className="w-48 shrink-0"><ProductCard product={p} compact catalog /></div>
                ))}
            </div>
        </div>
    );
}

function CategoryGrid({ catalog, limit }) {
    const categories = (catalog?.categories || []).slice(0, limit);
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((c) => (
                <a key={c.id} href={`/shop/products?category=${c.slug}`} className="p-4 rounded-xl bg-white border text-center font-semibold text-sm hover:border-[var(--offer-primary)]">
                    {c.name}
                </a>
            ))}
        </div>
    );
}

function HeroBanner({ props: p, onAction }) {
    const src = mediaUrl(p.src);
    return (
        <div className="relative rounded-3xl overflow-hidden min-h-[280px]">
            {src ? <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" /> : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--offer-primary) 0%, var(--offer-primary-dark) 100%)' }} />
            )}
            <div className={`absolute inset-0 ${p.overlay === 'light' ? 'bg-white/50' : 'bg-black/45'}`} />
            <div className={`relative z-10 p-10 text-center ${p.overlay === 'light' ? 'text-[var(--offer-text)]' : 'text-white'}`}>
                {p.badge && (
                    <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: 'var(--offer-secondary)', color: '#fff' }}>
                        {p.badge}
                    </span>
                )}
                <h1 className="text-3xl sm:text-5xl font-bold">{p.title}</h1>
                {p.subtitle && <p className="mt-3 text-lg opacity-90">{p.subtitle}</p>}
                {p.button && (
                    <button
                        type="button"
                        onClick={() => onAction?.(p.buttonUrl || '#checkout')}
                        className="mt-6 px-8 py-3 rounded-xl font-bold shadow-lg"
                        style={{ background: '#fff', color: 'var(--offer-primary)' }}
                    >
                        {p.button}
                    </button>
                )}
            </div>
        </div>
    );
}

function VideoEmbed({ url, caption }) {
    const embed = useMemo(() => parseVideo(url), [url]);
    if (!embed) return url ? <a href={url} className="text-[var(--offer-primary)] underline">Watch video</a> : null;
    return (
        <figure>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black"><iframe src={embed} title="Video" className="w-full h-full" allowFullScreen /></div>
            {caption && <figcaption className="text-center text-sm text-slate-500 mt-2">{caption}</figcaption>}
        </figure>
    );
}

function FaqBlock({ items = [], title }) {
    const [open, setOpen] = useState(0);
    return (
        <div>
            {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="rounded-xl border bg-white overflow-hidden">
                        <button type="button" className="w-full flex justify-between px-4 py-3 text-left font-medium" onClick={() => setOpen(open === i ? -1 : i)}>
                            {item.q} <ChevronDown size={18} className={open === i ? 'rotate-180' : ''} />
                        </button>
                        {open === i && <p className="px-4 pb-3 text-sm text-slate-600">{item.a}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TabsBlock({ items = [] }) {
    const [tab, setTab] = useState(0);
    return (
        <div>
            <div className="flex gap-2 border-b mb-4">
                {items.map((item, i) => (
                    <button key={i} type="button" onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === i ? 'border-[var(--offer-primary)] text-[var(--offer-primary)]' : 'border-transparent text-slate-500'}`}>{item.label}</button>
                ))}
            </div>
            <p className="text-slate-600">{items[tab]?.content}</p>
        </div>
    );
}

function AccordionBlock({ items = [] }) {
    const [open, setOpen] = useState(0);
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="border rounded-xl bg-white overflow-hidden">
                    <button type="button" className="w-full px-4 py-3 text-left font-medium flex justify-between" onClick={() => setOpen(open === i ? -1 : i)}>
                        {item.title} <ChevronDown size={16} className={open === i ? 'rotate-180' : ''} />
                    </button>
                    {open === i && <p className="px-4 pb-3 text-sm text-slate-600">{item.content}</p>}
                </div>
            ))}
        </div>
    );
}

function CountdownBlock({ targetDate, label }) {
    const [left, setLeft] = useState('');
    useEffect(() => {
        const tick = () => {
            const t = targetDate ? new Date(targetDate).getTime() - Date.now() : 0;
            if (t <= 0) { setLeft('00:00:00'); return; }
            const h = Math.floor(t / 3600000);
            const m = Math.floor((t % 3600000) / 60000);
            const s = Math.floor((t % 60000) / 1000);
            setLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);
    return (
        <div className="text-center p-6 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, var(--offer-accent) 0%, var(--offer-primary-dark) 100%)' }}>
            {label && <p className="text-sm uppercase tracking-wider mb-2 opacity-90" style={{ color: 'var(--offer-secondary)' }}>{label}</p>}
            <p className="text-4xl font-mono font-bold">{left || '--:--:--'}</p>
        </div>
    );
}

function editorPlaceholder(label) {
    return <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">{label}</div>;
}

function parseVideo(url) {
    if (!url) return null;
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return url.includes('embed') ? url : null;
}

export default memo(function PageRenderer({
    schema, catalog = {}, product, checkout, breakpoint = 'desktop', editorMode = false, selectedIds = [], onSelect,
}) {
    const scrollToCheckout = () => {
        const el = document.getElementById('offer-checkout');
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    const onAction = (url) => {
        if (!url || url === '#checkout') scrollToCheckout();
        else if (url.startsWith('#')) document.querySelector(url)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.open(url, '_blank');
    };

    const theme = schema?.theme || {};
    const cssVars = themeToCssVars(theme);
    const contentMaxWidth = theme.content_max_width || 'xl';
    const roots = useMemo(() => {
        if (!schema?.roots?.length) return [];
        const copy = JSON.parse(JSON.stringify(schema.roots));
        migrateLegacyLayout(copy);
        return copy;
    }, [schema?.roots]);

    return (
        <div style={cssVars} className="builder-page text-[var(--offer-text)]">
            {roots.map((node) => (
                <NodeRenderer
                    key={node.id}
                    node={node}
                    breakpoint={breakpoint}
                    catalog={catalog}
                    product={product}
                    checkout={checkout}
                    onAction={onAction}
                    editorMode={editorMode}
                    contentMaxWidth={contentMaxWidth}
                    selectedIds={selectedIds}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
});

export { NodeRenderer };
