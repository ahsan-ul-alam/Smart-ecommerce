import {
    Monitor, Tablet, Smartphone, Undo2, Redo2, Save, LayoutTemplate,
} from 'lucide-react';
import Button from '../../Components/UI/Button';
import { useBuilderStore } from '../store/builderStore';
import { PAGE_TEMPLATES, importTemplate } from '../schema/templates';

export default function BuilderToolbar({ onSave, saving, page }) {
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const setBreakpoint = useBuilderStore((s) => s.setBreakpoint);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const past = useBuilderStore((s) => s.past);
    const future = useBuilderStore((s) => s.future);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const lastSavedAt = useBuilderStore((s) => s.lastSavedAt);
    const importSchema = useBuilderStore((s) => s.importSchema);
    const theme = useBuilderStore((s) => s.theme);

    const devices = [
        { id: 'desktop', icon: Monitor, label: 'Desktop' },
        { id: 'tablet', icon: Tablet, label: 'Tablet' },
        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-white dark:bg-slate-900 sticky top-0 z-30">
            <div className="flex items-center gap-1 border rounded-lg p-0.5">
                {devices.map(({ id, icon: Icon, label }) => (
                    <button key={id} type="button" title={label} onClick={() => setBreakpoint(id)}
                        className={`p-2 rounded-md ${breakpoint === id ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <Icon size={16} />
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1">
                <button type="button" disabled={!past.length} onClick={undo} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30" title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
                <button type="button" disabled={!future.length} onClick={redo} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30" title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
            </div>

            <select
                className="text-xs border rounded-lg px-2 py-1.5 max-w-[160px]"
                defaultValue=""
                onChange={(e) => {
                    if (!e.target.value) return;
                    if (confirm('Replace page content with this template?')) {
                        importSchema(importTemplate(e.target.value, theme));
                    }
                    e.target.value = '';
                }}
            >
                <option value="">Templates…</option>
                {PAGE_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>

            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
                {isDirty ? 'Unsaved changes' : lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Auto-save on'}
            </span>

            {page.preview_url && (
                <a href={page.preview_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-teal-700 hidden sm:inline">Preview live</a>
            )}

            <Button onClick={onSave} loading={saving}><Save size={14} /> Save</Button>
        </div>
    );
}
