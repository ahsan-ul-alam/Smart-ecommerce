import { useForm } from '@inertiajs/react';
import { StickyNote } from 'lucide-react';
import Button from '../../UI/Button';
import Textarea from '../../UI/Textarea';

export default function OrderInternalNotes({ order }) {
    const noteForm = useForm({ admin_note: order.admin_note || '' });

    return (
        <div className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center gap-2">
                <StickyNote size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Internal Notes</h2>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    noteForm.patch(`/admin/orders/${order.id}/note`, { preserveScroll: true });
                }}
                className="p-5 space-y-3"
            >
                <p className="text-xs text-slate-400">Visible only to staff. Not shared with the customer.</p>
                <Textarea
                    value={noteForm.data.admin_note}
                    onChange={(e) => noteForm.setData('admin_note', e.target.value)}
                    rows={4}
                    placeholder="Customer requested evening delivery. Verify phone before dispatch."
                />
                <Button type="submit" variant="secondary" loading={noteForm.processing}>
                    Save Note
                </Button>
            </form>
        </div>
    );
}
