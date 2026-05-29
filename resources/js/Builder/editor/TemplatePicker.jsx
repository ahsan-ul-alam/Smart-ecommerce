import { useState } from 'react';
import { X, LayoutTemplate } from 'lucide-react';
import { PAGE_TEMPLATES, TEMPLATE_CATEGORIES } from '../schema/templates';
import { useBuilderStore } from '../store/builderStore';

export default function TemplatePicker() {
    const [open, setOpen] = useState(false);
    const importSchema = useBuilderStore((s) => s.importSchema);

    const apply = (id) => {
        const tpl = PAGE_TEMPLATES.find((t) => t.id === id);
        if (!tpl) return;
        if (id !== 'blank' && !confirm(`Load "${tpl.label}" template? Current content will be replaced.`)) return;
        importSchema(tpl.build());
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1.5 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
                <LayoutTemplate size={14} /> Templates
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <div>
                                <h3 className="font-bold text-lg">Page templates</h3>
                                <p className="text-xs text-slate-500">Kafela Mart · Ghorer Bazar · Wajih Premium & more</p>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
                        </div>

                        <div className="overflow-y-auto p-5 space-y-6">
                            {TEMPLATE_CATEGORIES.map((cat) => {
                                const items = PAGE_TEMPLATES.filter((t) => t.category === cat.id);
                                if (!items.length) return null;
                                return (
                                    <div key={cat.id}>
                                        <p className="text-xs font-bold uppercase text-slate-400 mb-3">{cat.label}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {items.map((tpl) => (
                                                <button
                                                    key={tpl.id}
                                                    type="button"
                                                    onClick={() => apply(tpl.id)}
                                                    className="text-left rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[var(--offer-primary,#16a34a)] overflow-hidden transition-all hover:shadow-md group"
                                                >
                                                    <div
                                                        className="h-20 flex items-end p-3 gap-1"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${tpl.preview.primary} 0%, color-mix(in srgb, ${tpl.preview.secondary} 40%, ${tpl.preview.primary}) 100%)`,
                                                        }}
                                                    >
                                                        <span className="w-8 h-2 rounded-full bg-white/90" />
                                                        <span className="w-12 h-2 rounded-full bg-white/60" />
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="font-bold text-sm group-hover:text-[var(--offer-primary,#16a34a)]">{tpl.label}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tpl.description}</p>
                                                        <div className="flex gap-1 mt-2">
                                                            <span className="w-4 h-4 rounded-full border" style={{ background: tpl.preview.primary }} />
                                                            <span className="w-4 h-4 rounded-full border" style={{ background: tpl.preview.secondary }} />
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
