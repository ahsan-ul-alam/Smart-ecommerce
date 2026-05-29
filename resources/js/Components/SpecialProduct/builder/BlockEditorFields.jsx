import { useState } from 'react';
import Input from '../../UI/Input';
import Textarea from '../../UI/Textarea';
import Select from '../../UI/Select';
import Button from '../../UI/Button';
import { Plus, Trash2 } from 'lucide-react';
import { mediaUrl } from '../../../utils/mediaUrl';
import { createBlock } from './blockRegistry';
import BlockStyleEditor from './BlockStyleEditor';

export default function BlockEditorFields({ block, onChange, depth = 0 }) {
    const patch = (data) => onChange({ ...block, ...data });
    const patchStyle = (style) => onChange({ ...block, style });

    const showStyle = !['spacer', 'divider', 'checkout', 'columns'].includes(block.type);

    return (
        <div className="space-y-3">
            {renderFields(block, patch, onChange, depth)}

            {showStyle && <BlockStyleEditor style={block.style} onChange={patchStyle} />}
        </div>
    );
}

function renderFields(block, patch, onChange, depth) {
    switch (block.type) {
        case 'heading':
            return (
                <>
                    <Textarea label="Text" value={block.text || ''} onChange={(e) => patch({ text: e.target.value })} rows={2} />
                    <Select label="Size" value={String(block.level || 2)} onChange={(e) => patch({ level: Number(e.target.value) })}
                        options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `H${n}` }))} />
                    <Select label="Align" value={block.align || 'left'} onChange={(e) => patch({ align: e.target.value })}
                        options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
                </>
            );

        case 'text':
        case 'cta':
            return (
                <>
                    <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <Textarea label="Body" value={block.body || ''} onChange={(e) => patch({ body: e.target.value })} rows={4} />
                    {block.type === 'cta' && <Input label="Button text" value={block.button || ''} onChange={(e) => patch({ button: e.target.value })} />}
                </>
            );

        case 'rich_text':
        case 'html':
            return (
                <Textarea label="HTML content" value={block.html || ''} onChange={(e) => patch({ html: e.target.value })} rows={8} className="font-mono text-xs" />
            );

        case 'list':
            return (
                <>
                    <Input label="Title (optional)" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!block.ordered} onChange={(e) => patch({ ordered: e.target.checked })} className="rounded" />
                        Numbered list
                    </label>
                    <Textarea label="Items (one per line)" value={(block.items || []).join('\n')} onChange={(e) => patch({ items: e.target.value.split('\n').filter(Boolean) })} rows={5} />
                </>
            );

        case 'quote':
            return (
                <>
                    <Textarea label="Quote" value={block.text || ''} onChange={(e) => patch({ text: e.target.value })} rows={3} />
                    <Input label="Author" value={block.author || ''} onChange={(e) => patch({ author: e.target.value })} />
                </>
            );

        case 'button':
            return (
                <>
                    <Input label="Button text" value={block.text || ''} onChange={(e) => patch({ text: e.target.value })} />
                    <Input label="Link URL (#checkout = scroll to order)" value={block.url || ''} onChange={(e) => patch({ url: e.target.value })} />
                    <Select label="Style" value={block.variant || 'primary'} onChange={(e) => patch({ variant: e.target.value })}
                        options={[{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'outline', label: 'Outline' }]} />
                    <Select label="Size" value={block.size || 'md'} onChange={(e) => patch({ size: e.target.value })}
                        options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
                </>
            );

        case 'spacer':
            return <Input label="Height (px)" type="number" value={block.height ?? 48} onChange={(e) => patch({ height: Number(e.target.value) })} />;

        case 'divider':
            return (
                <Select label="Style" value={block.variant || 'line'} onChange={(e) => patch({ variant: e.target.value })}
                    options={[{ value: 'line', label: 'Line' }, { value: 'dots', label: 'Dots' }]} />
            );

        case 'image':
        case 'banner':
            return (
                <>
                    {(block.src || block._pendingFile) && (
                        <img src={block._pendingFile ? URL.createObjectURL(block._pendingFile) : mediaUrl(block.src)} alt="" className="h-28 w-full object-cover rounded-lg" />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => patch({ _pendingFile: e.target.files?.[0] || null })} className="text-sm w-full" />
                    <Input label="Or image URL" value={block.src?.startsWith('http') ? block.src : ''} onChange={(e) => patch({ src: e.target.value, _pendingFile: null })} placeholder="https://..." />
                    {block.type === 'image' && (
                        <>
                            <Input label="Alt text" value={block.alt || ''} onChange={(e) => patch({ alt: e.target.value })} />
                            <Input label="Caption" value={block.caption || ''} onChange={(e) => patch({ caption: e.target.value })} />
                            <Input label="Link (optional)" value={block.link || ''} onChange={(e) => patch({ link: e.target.value })} />
                            <Select label="Width" value={block.width || 'full'} onChange={(e) => patch({ width: e.target.value })}
                                options={[{ value: 'full', label: 'Full' }, { value: 'medium', label: 'Medium' }, { value: 'narrow', label: 'Narrow' }]} />
                        </>
                    )}
                    {block.type === 'banner' && (
                        <>
                            <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                            <Input label="Subtitle" value={block.subtitle || ''} onChange={(e) => patch({ subtitle: e.target.value })} />
                            <Input label="Button text" value={block.button || ''} onChange={(e) => patch({ button: e.target.value })} />
                            <Input label="Button link" value={block.buttonUrl || ''} onChange={(e) => patch({ buttonUrl: e.target.value })} />
                            <Select label="Overlay" value={block.overlay || 'dark'} onChange={(e) => patch({ overlay: e.target.value })}
                                options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} />
                        </>
                    )}
                </>
            );

        case 'gallery':
            return (
                <>
                    <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <input type="file" accept="image/*" multiple onChange={(e) => patch({ _pendingFiles: Array.from(e.target.files || []) })} className="text-sm w-full" />
                    {(block.images || []).map((img, i) => (
                        <div key={i} className="flex gap-2 items-start border rounded-lg p-2">
                            {img.src && <img src={mediaUrl(img.src)} alt="" className="w-16 h-16 object-cover rounded" />}
                            <div className="flex-1 space-y-1">
                                <Input label="URL" value={img.src?.startsWith('http') ? img.src : ''} onChange={(e) => {
                                    const images = [...(block.images || [])];
                                    images[i] = { ...images[i], src: e.target.value };
                                    patch({ images });
                                }} />
                                <Input label="Alt" value={img.alt || ''} onChange={(e) => {
                                    const images = [...(block.images || [])];
                                    images[i] = { ...images[i], alt: e.target.value };
                                    patch({ images });
                                }} />
                            </div>
                            <button type="button" onClick={() => patch({ images: (block.images || []).filter((_, j) => j !== i) })} className="text-red-500 p-1"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={() => patch({ images: [...(block.images || []), { src: '', alt: '' }] })}>
                        <Plus size={14} /> Add image slot
                    </Button>
                </>
            );

        case 'video':
            return (
                <>
                    <Input label="YouTube / Vimeo URL" value={block.url || ''} onChange={(e) => patch({ url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                    <Input label="Caption" value={block.caption || ''} onChange={(e) => patch({ caption: e.target.value })} />
                </>
            );

        case 'columns':
            return (
                <>
                    <Select label="Columns" value={String(block.columns || 2)} onChange={(e) => {
                        const columns = Number(e.target.value);
                        const cols = [...(block.cols || [])];
                        while (cols.length < columns) cols.push({ blocks: [createBlock('text')] });
                        patch({ columns, cols: cols.slice(0, columns) });
                    }} options={[{ value: '2', label: '2 columns' }, { value: '3', label: '3 columns' }, { value: '4', label: '4 columns' }]} />
                    <Select label="Gap" value={block.gap || 'md'} onChange={(e) => patch({ gap: e.target.value })}
                        options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
                    {(block.cols || []).slice(0, block.columns || 2).map((col, ci) => (
                        <div key={ci} className="border rounded-lg p-3 bg-white dark:bg-slate-900 space-y-2">
                            <p className="text-xs font-bold text-slate-500">Column {ci + 1}</p>
                            {(col.blocks || []).map((nested, ni) => (
                                <NestedBlockRow
                                    key={nested.id || ni}
                                    block={nested}
                                    onChange={(updated) => {
                                        const cols = [...block.cols];
                                        const blocks = [...(cols[ci].blocks || [])];
                                        blocks[ni] = updated;
                                        cols[ci] = { ...cols[ci], blocks };
                                        patch({ cols });
                                    }}
                                    onRemove={() => {
                                        const cols = [...block.cols];
                                        cols[ci] = { ...cols[ci], blocks: (cols[ci].blocks || []).filter((_, j) => j !== ni) };
                                        patch({ cols });
                                    }}
                                    depth={depth + 1}
                                />
                            ))}
                            <Button type="button" variant="secondary" onClick={() => {
                                const cols = [...block.cols];
                                cols[ci] = { ...cols[ci], blocks: [...(cols[ci].blocks || []), createBlock('text')] };
                                patch({ cols });
                            }}>
                                <Plus size={14} /> Add to column {ci + 1}
                            </Button>
                        </div>
                    ))}
                </>
            );

        case 'icon_box':
            return (
                <>
                    <Input label="Icon (emoji or text)" value={block.icon || ''} onChange={(e) => patch({ icon: e.target.value })} />
                    <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <Textarea label="Body" value={block.body || ''} onChange={(e) => patch({ body: e.target.value })} rows={2} />
                    <Input label="Link (optional)" value={block.link || ''} onChange={(e) => patch({ link: e.target.value })} />
                </>
            );

        case 'features':
            return (
                <>
                    <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <Textarea label="Items (one per line)" value={(block.items || []).join('\n')} onChange={(e) => patch({ items: e.target.value.split('\n').filter(Boolean) })} rows={4} />
                </>
            );

        case 'stats':
            return (
                <Textarea label="Stats (value|label per line)" value={(block.items || []).map((it) => `${it.value}|${it.label}`).join('\n')}
                    onChange={(e) => patch({
                        items: e.target.value.split('\n').filter(Boolean).map((line) => {
                            const [value, label] = line.split('|');
                            return { value: value?.trim(), label: label?.trim() };
                        }),
                    })} rows={4} placeholder="24h|Fast delivery" />
            );

        case 'testimonials':
            return (
                <>
                    <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <Textarea label="Reviews (name|text|rating per line)" value={(block.items || []).map((t) => `${t.name}|${t.text}|${t.rating}`).join('\n')}
                        onChange={(e) => patch({
                            items: e.target.value.split('\n').filter(Boolean).map((line) => {
                                const [name, text, rating] = line.split('|');
                                return { name: name?.trim(), text: text?.trim(), rating: Number(rating) || 5 };
                            }),
                        })} rows={5} />
                </>
            );

        case 'faq':
            return (
                <>
                    <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <Textarea label="FAQ (question|answer per line)" value={(block.items || []).map((it) => `${it.q}|${it.a}`).join('\n')}
                        onChange={(e) => patch({
                            items: e.target.value.split('\n').filter(Boolean).map((line) => {
                                const [q, a] = line.split('|');
                                return { q: q?.trim(), a: a?.trim() };
                            }),
                        })} rows={5} />
                </>
            );

        case 'checkout':
            return (
                <>
                    <Input label="Title" value={block.title || ''} onChange={(e) => patch({ title: e.target.value })} />
                    <Input label="Subtitle" value={block.subtitle || ''} onChange={(e) => patch({ subtitle: e.target.value })} />
                </>
            );

        case 'product':
            return <p className="text-sm text-slate-500">Shows the linked product from page settings.</p>;

        default:
            return null;
    }
}

function NestedBlockRow({ block, onChange, onRemove, depth }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border rounded p-2 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between gap-2">
                <button type="button" className="text-xs font-semibold text-slate-600" onClick={() => setOpen(!open)}>
                    {block.type} {open ? '▼' : '▶'}
                </button>
                <button type="button" onClick={onRemove} className="text-red-500"><Trash2 size={12} /></button>
            </div>
            {open && <div className="mt-2"><BlockEditorFields block={block} onChange={onChange} depth={depth} /></div>}
        </div>
    );
}
