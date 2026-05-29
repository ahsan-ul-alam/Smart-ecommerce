import Input from '../../Components/UI/Input';
import Textarea from '../../Components/UI/Textarea';
import Select from '../../Components/UI/Select';
import { useBuilderStore, useSelectedNode } from '../store/builderStore';
import { COMPONENT_LABELS, DATA_SOURCE_TYPES, LAYOUT_TYPES } from '../registry/components';
import { mediaUrl } from '../../utils/mediaUrl';

export default function PropertyPanel({ catalog = {}, mode = 'all' }) {
    const node = useSelectedNode();
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const updateNodeProps = useBuilderStore((s) => s.updateNodeProps);
    const updateNodeStyle = useBuilderStore((s) => s.updateNodeStyle);
    const duplicateNode = useBuilderStore((s) => s.duplicateNode);
    const removeNode = useBuilderStore((s) => s.removeNode);

    const showContent = mode === 'all' || mode === 'content';
    const showStyle = mode === 'all' || mode === 'style';

    if (!node) {
        return (
            <p className="text-sm text-slate-500 p-4">
                {mode === 'style' ? 'Select a block to edit spacing, colors, and typography.' : 'Select a block on the canvas to edit its content.'}
            </p>
        );
    }

    const p = node.props || {};
    const style = node.style?.[breakpoint] || {};
    const setProp = (key, val) => updateNodeProps(node.id, { [key]: val });
    const setStyle = (key, val) => updateNodeStyle(node.id, breakpoint, { [key]: val });

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{COMPONENT_LABELS[node.type] || node.type}</p>
                    {showStyle && <p className="text-[10px] text-slate-400 mt-0.5">Breakpoint: {breakpoint}</p>}
                </div>
                {showContent && (
                    <div className="flex gap-1 text-xs shrink-0">
                        <button type="button" onClick={() => duplicateNode(node.id)} className="px-2 py-1 rounded border hover:bg-slate-50">Copy</button>
                        <button type="button" onClick={() => removeNode(node.id)} className="px-2 py-1 rounded border text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                )}
            </div>

            {showContent && renderContentFields(node, p, setProp, catalog)}

            {showStyle && (
                <div className={`space-y-3 ${showContent ? 'pt-4 border-t' : ''}`}>
                    <p className="text-xs font-bold uppercase text-slate-400">Layout & appearance</p>
                    <Input label="Padding" value={style.padding || ''} onChange={(e) => setStyle('padding', e.target.value)} placeholder="16px or 1rem 2rem" />
                    <Input label="Margin" value={style.margin || ''} onChange={(e) => setStyle('margin', e.target.value)} />
                    <Input label="Width" value={style.width || ''} onChange={(e) => setStyle('width', e.target.value)} />
                    <Input label="Min height" value={style.minHeight || ''} onChange={(e) => setStyle('minHeight', e.target.value)} />
                    <Input label="Background" type="color" value={style.backgroundColor || '#ffffff'} onChange={(e) => setStyle('backgroundColor', e.target.value === '#ffffff' ? '' : e.target.value)} />
                    <Input label="Text color" type="color" value={style.color || '#000000'} onChange={(e) => setStyle('color', e.target.value === '#000000' ? '' : e.target.value)} />
                    <Input label="Font size" value={style.fontSize || ''} onChange={(e) => setStyle('fontSize', e.target.value)} placeholder="1.25rem" />
                    <Select label="Font weight" value={style.fontWeight || ''} onChange={(e) => setStyle('fontWeight', e.target.value)}
                        options={[{ value: '', label: 'Default' }, { value: '400', label: 'Normal' }, { value: '600', label: 'Semibold' }, { value: '700', label: 'Bold' }]} />
                    <Select label="Text align" value={style.textAlign || ''} onChange={(e) => setStyle('textAlign', e.target.value)}
                        options={[{ value: '', label: 'Default' }, { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
                    <Input label="Border radius" value={style.borderRadius || ''} onChange={(e) => setStyle('borderRadius', e.target.value)} placeholder="12px" />
                    <Input label="Border" value={style.border || ''} onChange={(e) => setStyle('border', e.target.value)} placeholder="1px solid #e2e8f0" />
                    <Input label="Box shadow" value={style.boxShadow || ''} onChange={(e) => setStyle('boxShadow', e.target.value)} />
                    <Input label="Opacity" type="number" min="0" max="1" step="0.1" value={style.opacity ?? ''} onChange={(e) => setStyle('opacity', e.target.value ? Number(e.target.value) : undefined)} />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={style.display === 'none'} onChange={(e) => setStyle('display', e.target.checked ? 'none' : undefined)} />
                        Hidden on {breakpoint}
                    </label>
                </div>
            )}

            {(showContent || mode === 'all') && (
                <div className="pt-4 border-t space-y-2">
                    <p className="text-xs font-bold uppercase text-slate-400">Animation</p>
                    <Select label="Type" value={node.animation?.type || 'none'} onChange={(e) => useBuilderStore.getState().updateNode(node.id, { animation: { ...node.animation, type: e.target.value } })}
                        options={[{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide' }, { value: 'zoom', label: 'Zoom' }, { value: 'scale', label: 'Scale' }]} />
                </div>
            )}
        </div>
    );
}

function renderContentFields(node, p, setProp, catalog) {
    switch (node.type) {
        case 'heading':
            return (
                <>
                    <Textarea label="Text" value={p.text || ''} onChange={(e) => setProp('text', e.target.value)} rows={2} />
                    <Select label="Level" value={String(p.level || 2)} onChange={(e) => setProp('level', Number(e.target.value))}
                        options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `H${n}` }))} />
                </>
            );
        case 'text':
            return (
                <>
                    <Input label="Title" value={p.title || ''} onChange={(e) => setProp('title', e.target.value)} />
                    <Textarea label="Body" value={p.body || p.text || ''} onChange={(e) => setProp('body', e.target.value)} rows={4} />
                </>
            );
        case 'button':
            return (
                <>
                    <Input label="Text" value={p.text || ''} onChange={(e) => setProp('text', e.target.value)} />
                    <Input label="URL (#checkout)" value={p.url || ''} onChange={(e) => setProp('url', e.target.value)} />
                </>
            );
        case 'image':
        case 'hero_banner':
            return (
                <>
                    {(p.src || node._pendingFile) && <img src={node._pendingFile ? URL.createObjectURL(node._pendingFile) : mediaUrl(p.src)} alt="" className="rounded-lg h-24 w-full object-cover" />}
                    <input type="file" accept="image/*" className="text-xs w-full" onChange={(e) => useBuilderStore.getState().updateNode(node.id, { _pendingFile: e.target.files?.[0] })} />
                    <Input label="Image URL" value={p.src?.startsWith('http') ? p.src : ''} onChange={(e) => setProp('src', e.target.value)} />
                    {node.type === 'hero_banner' && (
                        <>
                            <Input label="Title" value={p.title || ''} onChange={(e) => setProp('title', e.target.value)} />
                            <Input label="Subtitle" value={p.subtitle || ''} onChange={(e) => setProp('subtitle', e.target.value)} />
                            <Input label="Button" value={p.button || ''} onChange={(e) => setProp('button', e.target.value)} />
                        </>
                    )}
                </>
            );
        case 'video':
            return <Input label="YouTube / Vimeo URL" value={p.url || ''} onChange={(e) => setProp('url', e.target.value)} />;
        case 'product_grid':
        case 'product_carousel':
            return (
                <>
                    <Select label="Data source" value={p.dataSource?.type || 'featured'} onChange={(e) => setProp('dataSource', { ...p.dataSource, type: e.target.value })}
                        options={DATA_SOURCE_TYPES} />
                    <Input label="Limit" type="number" value={p.dataSource?.limit || 8} onChange={(e) => setProp('dataSource', { ...p.dataSource, limit: Number(e.target.value) })} />
                    {p.dataSource?.type === 'category' && (
                        <Select label="Category" value={String(p.dataSource?.category_id || '')} onChange={(e) => setProp('dataSource', { ...p.dataSource, category_id: Number(e.target.value) })}
                            options={[{ value: '', label: 'Select…' }, ...(catalog.categories || []).map((c) => ({ value: String(c.id), label: c.name }))]} />
                    )}
                    {node.type === 'product_grid' && (
                        <Select label="Columns" value={String(p.columns || 4)} onChange={(e) => setProp('columns', Number(e.target.value))}
                            options={[{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} />
                    )}
                </>
            );
        case 'stats':
            return <Textarea label="Stats (value|label per line)" value={(p.items || []).map((i) => `${i.value}|${i.label}`).join('\n')}
                onChange={(e) => setProp('items', e.target.value.split('\n').filter(Boolean).map((l) => { const [value, label] = l.split('|'); return { value: value?.trim(), label: label?.trim() }; }))} rows={4} />;
        case 'features':
            return (
                <>
                    <Input label="Title" value={p.title || ''} onChange={(e) => setProp('title', e.target.value)} />
                    <Textarea label="Items (one per line)" value={(p.items || []).join('\n')} onChange={(e) => setProp('items', e.target.value.split('\n').filter(Boolean))} rows={4} />
                </>
            );
        case 'faq':
            return (
                <>
                    <Input label="Title" value={p.title || ''} onChange={(e) => setProp('title', e.target.value)} />
                    <Textarea label="Q|A per line" value={(p.items || []).map((i) => `${i.q}|${i.a}`).join('\n')}
                        onChange={(e) => setProp('items', e.target.value.split('\n').filter(Boolean).map((l) => { const [q, a] = l.split('|'); return { q: q?.trim(), a: a?.trim() }; }))} rows={5} />
                </>
            );
        case 'checkout':
            return (
                <>
                    <Input label="Title" value={p.title || ''} onChange={(e) => setProp('title', e.target.value)} />
                    <Input label="Subtitle" value={p.subtitle || ''} onChange={(e) => setProp('subtitle', e.target.value)} />
                </>
            );
        case 'countdown':
            return (
                <>
                    <Input label="Target date" type="datetime-local" value={p.targetDate?.slice(0, 16) || ''} onChange={(e) => setProp('targetDate', e.target.value ? new Date(e.target.value).toISOString() : '')} />
                    <Input label="Label" value={p.label || ''} onChange={(e) => setProp('label', e.target.value)} />
                </>
            );
        default:
            if (LAYOUT_TYPES.includes(node.type)) {
                return <p className="text-xs text-slate-500">Layout block — use widgets to add content blocks to the page.</p>;
            }
            return null;
    }
}
