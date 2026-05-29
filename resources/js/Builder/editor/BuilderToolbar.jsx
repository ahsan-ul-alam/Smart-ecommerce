import {
    Monitor, Tablet, Smartphone, Undo2, Redo2, Save, ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';
import Button from '../../Components/UI/Button';
import { useBuilderStore } from '../store/builderStore';
import TemplatePicker from './TemplatePicker';

export default function BuilderToolbar({ onSave, saving, page, embedded = false }) {
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const setBreakpoint = useBuilderStore((s) => s.setBreakpoint);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const past = useBuilderStore((s) => s.past);
    const future = useBuilderStore((s) => s.future);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const lastSavedAt = useBuilderStore((s) => s.lastSavedAt);

    const devices = [
        { id: 'desktop', icon: Monitor, label: 'Desktop' },
        { id: 'tablet', icon: Tablet, label: 'Tablet' },
        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
    ];

    return (
        <div className={`flex flex-wrap items-center gap-2 ${embedded ? 'py-1' : 'px-4 py-2 border-b bg-white dark:bg-slate-900 sticky top-0 z-30'}`}>
            <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
                {devices.map(({ id, icon: Icon, label }) => (
                    <button key={id} type="button" title={label} onClick={() => setBreakpoint(id)}
                        className={`p-1.5 rounded-md ${breakpoint === id ? 'bg-white dark:bg-slate-900 text-[var(--offer-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Icon size={15} />
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-0.5">
                <button type="button" disabled={!past.length} onClick={undo} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30" title="Undo (Ctrl+Z)"><Undo2 size={15} /></button>
                <button type="button" disabled={!future.length} onClick={redo} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30" title="Redo (Ctrl+Y)"><Redo2 size={15} /></button>
            </div>

            <TemplatePicker />

            <div className="flex items-center gap-2 ml-auto shrink-0">
                <span className="text-[10px] text-slate-400 hidden md:inline">
                    {isDirty ? 'Unsaved changes' : lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Auto-save on'}
                </span>

                {page.preview_url && (
                    <a
                        href={page.preview_url}
                        target="_blank"
                        rel="noreferrer"
                        title={isDirty ? 'Save first to see your latest changes on the live page' : page.is_published ? 'Open live page' : 'Open draft preview (admin only)'}
                        className={clsx(
                            'inline-flex items-center justify-center gap-1.5 font-medium transition-premium',
                            '!py-1.5 !px-3 !text-xs rounded-lg border',
                            'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200',
                            'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
                        )}
                    >
                        <ExternalLink size={13} />
                        {page.is_published ? 'Open page' : 'Preview'}
                    </a>
                )}

                <Button onClick={onSave} loading={saving} className="!py-1.5 !px-3 !text-xs">
                    <Save size={13} /> Save
                </Button>
            </div>
        </div>
    );
}
