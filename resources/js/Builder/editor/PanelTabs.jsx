export default function PanelTabs({ tabs, active, onChange }) {
    return (
        <div className="flex border-b bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                        active === tab.id
                            ? 'border-[var(--offer-primary)] text-[var(--offer-primary)] bg-white dark:bg-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
