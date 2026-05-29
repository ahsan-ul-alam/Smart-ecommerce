import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, GripVertical, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { BLOCK_CATEGORIES, BLOCK_LABELS, createBlock } from './blockRegistry';
import BlockEditorFields from './BlockEditorFields';
import LandingBlockRenderer from '../LandingBlockRenderer';
import Button from '../../UI/Button';

export default function PageBuilder({ blocks, onChange, product, theme }) {
    const [selected, setSelected] = useState(0);
    const [preview, setPreview] = useState(false);
    const [libraryOpen, setLibraryOpen] = useState(true);

    const updateBlock = (index, block) => {
        const next = [...blocks];
        next[index] = block;
        onChange(next);
    };

    const moveBlock = (index, dir) => {
        const next = index + dir;
        if (next < 0 || next >= blocks.length) return;
        const copy = [...blocks];
        [copy[index], copy[next]] = [copy[next], copy[index]];
        onChange(copy);
        setSelected(next);
    };

    const removeBlock = (index) => {
        onChange(blocks.filter((_, i) => i !== index));
        setSelected(Math.max(0, index - 1));
    };

    const addBlock = (type) => {
        onChange([...blocks, createBlock(type)]);
        setSelected(blocks.length);
    };

    const selectedBlock = blocks[selected];

    if (preview) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-600">Live preview</p>
                    <Button type="button" variant="secondary" onClick={() => setPreview(false)}>Back to editor</Button>
                </div>
                <div
                    className="rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden bg-white"
                    style={{ '--offer-primary': theme?.primary_color || '#0d9488', '--offer-secondary': theme?.secondary_color || '#f59e0b' }}
                >
                    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
                        {blocks.map((block, i) => (
                            <div key={block.id || i}>
                                <LandingBlockRenderer block={block} product={product} onScrollToCheckout={() => {}} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[520px]">
            {/* Widget library */}
            <aside className={`lg:col-span-3 ${libraryOpen ? '' : 'hidden lg:block'}`}>
                <div className="sticky top-4 rounded-xl border bg-white dark:bg-slate-900 p-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold flex items-center gap-1"><LayoutGrid size={16} /> Widgets</span>
                    </div>
                    {BLOCK_CATEGORIES.map((cat) => (
                        <div key={cat.id} className="mb-4">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-2">{cat.label}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {cat.types.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => addBlock(type)}
                                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[var(--color-primary,#0d9488)] hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                                    >
                                        <Plus size={10} className="inline mr-0.5" />
                                        {BLOCK_LABELS[type] || type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Canvas */}
            <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-600">Page canvas ({blocks.length} blocks)</p>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => setPreview(true)}>
                            <Eye size={14} /> Preview
                        </Button>
                        <button type="button" className="lg:hidden text-xs text-primary" onClick={() => setLibraryOpen(!libraryOpen)}>
                            {libraryOpen ? 'Hide' : 'Show'} widgets
                        </button>
                    </div>
                </div>

                {blocks.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed p-12 text-center text-slate-500">
                        <p className="mb-2">Empty page — add widgets from the library</p>
                        <Button type="button" onClick={() => addBlock('checkout')}>Add order form</Button>
                    </div>
                ) : (
                    blocks.map((block, i) => (
                        <div
                            key={block.id || i}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelected(i)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelected(i)}
                            className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
                                selected === i
                                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                    <GripVertical size={12} /> {BLOCK_LABELS[block.type] || block.type}
                                </span>
                                <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                                    <button type="button" disabled={i === 0} onClick={() => moveBlock(i, -1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"><ChevronUp size={14} /></button>
                                    <button type="button" disabled={i >= blocks.length - 1} onClick={() => moveBlock(i, 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"><ChevronDown size={14} /></button>
                                    <button type="button" onClick={() => removeBlock(i)} className="p-1 rounded text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 truncate">{blockPreviewLabel(block)}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Inspector */}
            <aside className="lg:col-span-4">
                <div className="sticky top-4 rounded-xl border bg-white dark:bg-slate-900 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {selectedBlock ? (
                        <>
                            <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">
                                Edit: {BLOCK_LABELS[selectedBlock.type] || selectedBlock.type}
                            </p>
                            <BlockEditorFields
                                block={selectedBlock}
                                onChange={(updated) => updateBlock(selected, updated)}
                            />
                        </>
                    ) : (
                        <p className="text-sm text-slate-500">Select a block on the canvas to edit its content and style.</p>
                    )}
                </div>
            </aside>
        </div>
    );
}

function blockPreviewLabel(block) {
    switch (block.type) {
        case 'heading': return block.text;
        case 'text': return block.title || block.body;
        case 'rich_text':
        case 'html': return (block.html || '').replace(/<[^>]+>/g, '').slice(0, 60);
        case 'image':
        case 'banner': return block.src ? 'Image set' : 'No image';
        case 'video': return block.url || 'No video URL';
        case 'checkout': return block.title || 'Order form';
        case 'columns': return `${block.columns || 2} columns`;
        default: return block.title || block.text || block.type;
    }
}
