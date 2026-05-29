import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import ProductThumbnail from '../Catalog/ProductThumbnail';
import ProductPrice from '../Catalog/ProductPrice';
import OfferCheckoutForm from './OfferCheckoutForm';
import BlockWrapper from './BlockWrapper';
import { mediaUrl } from '../../utils/mediaUrl';

export default function LandingBlockRenderer({
    block,
    product,
    checkoutProps = null,
    onScrollToCheckout,
    renderBlock,
}) {
    const render = renderBlock || ((b, props) => (
        <LandingBlockRenderer block={b} product={product} checkoutProps={checkoutProps} onScrollToCheckout={onScrollToCheckout} renderBlock={renderBlock} {...props} />
    ));

    const handleAction = (url) => {
        if (!url || url === '#checkout') {
            onScrollToCheckout?.();
            return;
        }
        if (url.startsWith('#')) {
            document.querySelector(url)?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        window.open(url, url.startsWith('http') ? '_blank' : '_self');
    };

    const content = (() => {
        switch (block.type) {
            case 'heading': {
                const Tag = `h${Math.min(6, Math.max(1, block.level || 2))}`;
                return (
                    <Tag className={`font-bold text-slate-900 ${headingSize(block.level)}`} style={{ color: block.color || undefined }}>
                        {block.text}
                    </Tag>
                );
            }

            case 'text':
                return (
                    <div>
                        {block.title && <h2 className="text-2xl font-bold text-slate-900 mb-3">{block.title}</h2>}
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{block.body}</p>
                    </div>
                );

            case 'rich_text':
            case 'html':
                return (
                    <div
                        className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-[var(--offer-primary)]"
                        dangerouslySetInnerHTML={{ __html: block.html || '' }}
                    />
                );

            case 'list':
                return (
                    <div>
                        {block.title && <h2 className="text-2xl font-bold text-slate-900 mb-4">{block.title}</h2>}
                        {block.ordered ? (
                            <ol className="list-decimal list-inside space-y-2 text-slate-600">
                                {(block.items ?? []).map((item, i) => <li key={i}>{item}</li>)}
                            </ol>
                        ) : (
                            <ul className="list-disc list-inside space-y-2 text-slate-600">
                                {(block.items ?? []).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        )}
                    </div>
                );

            case 'quote':
                return (
                    <blockquote className="border-l-4 border-[var(--offer-primary)] pl-6 py-2">
                        <p className="text-lg italic text-slate-700">&ldquo;{block.text}&rdquo;</p>
                        {block.author && <cite className="block mt-2 text-sm font-semibold text-slate-500 not-italic">— {block.author}</cite>}
                    </blockquote>
                );

            case 'button':
                return (
                    <ButtonBlock block={block} onAction={handleAction} />
                );

            case 'spacer':
                return <div style={{ height: block.height || 32 }} aria-hidden />;

            case 'divider':
                return block.variant === 'dots' ? (
                    <p className="text-center text-slate-300 tracking-widest">• • •</p>
                ) : (
                    <hr className="border-slate-200" />
                );

            case 'image': {
                const src = mediaUrl(block.src);
                if (!src) return null;
                const img = (
                    <img src={src} alt={block.alt || ''} className={`rounded-2xl ${imageWidthClass(block.width)} mx-auto`} />
                );
                return (
                    <figure>
                        {block.link ? (
                            <a href={block.link} onClick={(e) => { if (block.link === '#checkout') { e.preventDefault(); handleAction('#checkout'); } }}>
                                {img}
                            </a>
                        ) : img}
                        {block.caption && <figcaption className="text-center text-sm text-slate-500 mt-2">{block.caption}</figcaption>}
                    </figure>
                );
            }

            case 'gallery':
                return (
                    <div>
                        {block.title && <h2 className="text-2xl font-bold text-slate-900 mb-4">{block.title}</h2>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(block.images ?? []).filter((img) => img.src).map((img, i) => (
                                <img key={i} src={mediaUrl(img.src)} alt={img.alt || ''} className="rounded-xl aspect-square object-cover w-full" />
                            ))}
                        </div>
                    </div>
                );

            case 'video':
                return <VideoBlock block={block} />;

            case 'banner': {
                const src = mediaUrl(block.src);
                return (
                    <div className="relative rounded-3xl overflow-hidden min-h-[200px]">
                        {src ? <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" /> : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--offer-primary)] to-slate-800" />
                        )}
                        <div className={`absolute inset-0 ${block.overlay === 'light' ? 'bg-white/50' : 'bg-black/50'}`} />
                        <div className={`relative z-10 p-8 sm:p-12 text-center ${block.overlay === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {block.title && <h2 className="text-2xl sm:text-4xl font-bold mb-2">{block.title}</h2>}
                            {block.subtitle && <p className="opacity-90 mb-6">{block.subtitle}</p>}
                            {block.button && (
                                <button type="button" onClick={() => handleAction(block.buttonUrl || '#checkout')} className="px-6 py-3 rounded-xl bg-white text-[var(--offer-primary)] font-bold">
                                    {block.button}
                                </button>
                            )}
                        </div>
                    </div>
                );
            }

            case 'columns': {
                const count = block.columns || 2;
                const gap = block.gap === 'lg' ? 'gap-8' : block.gap === 'sm' ? 'gap-3' : 'gap-6';
                const grid = count >= 4 ? 'sm:grid-cols-4' : count === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
                return (
                    <div className={`grid grid-cols-1 ${grid} ${gap}`}>
                        {(block.cols ?? []).slice(0, count).map((col, ci) => (
                            <div key={ci} className="space-y-8 min-w-0">
                                {(col.blocks ?? []).map((nested, ni) => (
                                    <div key={nested.id || ni}>{render(nested)}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                );
            }

            case 'icon_box':
                return (
                    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
                        <span className="text-3xl mb-3 block">{block.icon || '✓'}</span>
                        <h3 className="font-bold text-slate-900">{block.title}</h3>
                        {block.body && <p className="text-sm text-slate-600 mt-2">{block.body}</p>}
                        {block.link && (
                            <a href={block.link} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--offer-primary)] mt-3">
                                Learn more <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                );

            case 'stats':
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(block.items ?? []).map((item, i) => (
                            <div key={i} className="text-center p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                                <p className="text-2xl font-bold text-[var(--offer-primary)]">{item.value}</p>
                                <p className="text-xs text-slate-600 mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                );

            case 'features':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{block.title || 'Features'}</h2>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            {(block.items ?? []).map((item, j) => (
                                <li key={j} className="flex gap-2 p-3 rounded-xl bg-white border border-slate-100 text-sm">
                                    <span className="text-[var(--offer-primary)] font-bold">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );

            case 'testimonials':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{block.title || 'Reviews'}</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {(block.items ?? []).map((t, j) => (
                                <blockquote key={j} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                    <p className="text-amber-500 text-sm mb-2">{'★'.repeat(t.rating || 5)}</p>
                                    <p className="text-slate-600 text-sm italic">&ldquo;{t.text}&rdquo;</p>
                                    <p className="text-xs font-semibold text-slate-800 mt-2">— {t.name}</p>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                );

            case 'faq':
                return <FaqBlock block={block} />;

            case 'cta':
                return (
                    <div className="text-center py-8 px-6 rounded-3xl bg-gradient-to-br from-[var(--offer-primary)] to-teal-700 text-white">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{block.title}</h2>
                        <p className="text-white/90 mb-6">{block.body}</p>
                        <button type="button" onClick={() => handleAction('#checkout')} className="inline-flex px-8 py-3 rounded-xl bg-white text-[var(--offer-primary)] font-bold hover:opacity-95">
                            {block.button || 'Order now'}
                        </button>
                    </div>
                );

            case 'product':
                return product ? (
                    <div className="grid sm:grid-cols-2 gap-6 items-center p-6 rounded-2xl bg-white border shadow-sm">
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                            <ProductThumbnail product={product} className="w-full h-full" size="lg" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{product.name}</h3>
                            <ProductPrice product={product} className="text-2xl font-bold text-[var(--offer-primary)] mt-2" />
                            <p className="text-slate-600 mt-3 text-sm">{product.short_description}</p>
                        </div>
                    </div>
                ) : null;

            case 'checkout':
                return checkoutProps ? (
                    <OfferCheckoutForm {...checkoutProps} title={block.title || 'Place your order'} subtitle={block.subtitle} />
                ) : null;

            default:
                return null;
        }
    })();

    if (!content) return null;

    if (['spacer', 'divider', 'checkout', 'columns'].includes(block.type)) {
        return content;
    }

    return <BlockWrapper block={block}>{content}</BlockWrapper>;
}

function ButtonBlock({ block, onAction }) {
    const variants = {
        primary: 'bg-[var(--offer-primary)] text-white',
        secondary: 'bg-white border-2 border-[var(--offer-primary)] text-[var(--offer-primary)]',
        outline: 'border border-slate-300 text-slate-800 bg-white',
    };
    const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3', lg: 'px-8 py-4 text-lg' };

    return (
        <button
            type="button"
            onClick={() => onAction(block.url)}
            className={`inline-flex rounded-xl font-bold ${variants[block.variant] || variants.primary} ${sizes[block.size] || sizes.md}`}
        >
            {block.text}
        </button>
    );
}

function VideoBlock({ block }) {
    const embed = parseVideoEmbed(block.url);
    if (!embed) {
        return block.url ? (
            <a href={block.url} target="_blank" rel="noreferrer" className="text-[var(--offer-primary)] font-semibold underline">
                Watch video
            </a>
        ) : null;
    }

    return (
        <figure>
            <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video">
                <iframe
                    src={embed}
                    title="Video"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            {block.caption && <figcaption className="text-center text-sm text-slate-500 mt-2">{block.caption}</figcaption>}
        </figure>
    );
}

function FaqBlock({ block }) {
    const [open, setOpen] = useState(0);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{block.title || 'FAQ'}</h2>
            <div className="space-y-2">
                {(block.items ?? []).map((item, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-slate-800"
                            onClick={() => setOpen(open === i ? -1 : i)}
                        >
                            {item.q}
                            <ChevronDown size={18} className={open === i ? 'rotate-180' : ''} />
                        </button>
                        {open === i && <p className="px-4 pb-3 text-sm text-slate-600">{item.a}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function headingSize(level) {
    const map = { 1: 'text-4xl sm:text-5xl', 2: 'text-3xl sm:text-4xl', 3: 'text-2xl sm:text-3xl', 4: 'text-xl sm:text-2xl', 5: 'text-lg', 6: 'text-base' };
    return map[level] || map[2];
}

function imageWidthClass(width) {
    if (width === 'narrow') return 'max-w-md w-full';
    if (width === 'medium') return 'max-w-2xl w-full';
    return 'w-full';
}

function parseVideoEmbed(url) {
    if (!url) return null;
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com')) return url;
    return null;
}
