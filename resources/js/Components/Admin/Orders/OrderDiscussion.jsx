import { formatDateTime, initials } from './orderUtils';

export default function OrderDiscussion({ statusHistories = [], adminNote }) {
    const messages = statusHistories
        .filter((h) => h.note)
        .map((h) => ({
            id: `${h.status}-${h.created_at}`,
            name: h.user_name ?? 'System',
            time: h.created_at,
            message: h.note,
            context: `Status: ${h.status_label}`,
        }));

    if (adminNote) {
        messages.unshift({
            id: 'admin-note',
            name: 'Staff',
            time: null,
            message: adminNote,
            context: 'Internal note',
            pinned: true,
        });
    }

    const sorted = messages.sort((a, b) => {
        if (!a.time) return -1;
        if (!b.time) return 1;
        return new Date(b.time) - new Date(a.time);
    });

    return (
        <div className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Order Discussion</h2>
                <p className="text-xs text-slate-400 mt-0.5">Team notes from status updates and internal comments</p>
            </div>
            <div className="p-5 sm:p-6">
                {sorted.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">
                        No discussion yet. Add notes when updating status or in Internal Notes.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {sorted.map((msg) => (
                            <li
                                key={msg.id}
                                className={msg.pinned ? 'p-4 rounded-xl bg-primary/5 border border-primary/10' : 'flex gap-3'}
                            >
                                {!msg.pinned && (
                                    <div
                                        className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                        style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
                                    >
                                        {initials(msg.name)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{msg.name}</span>
                                        {msg.time && (
                                            <time className="text-xs text-slate-400">{formatDateTime(msg.time)}</time>
                                        )}
                                        <span className="text-xs text-slate-400">· {msg.context}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{msg.message}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
