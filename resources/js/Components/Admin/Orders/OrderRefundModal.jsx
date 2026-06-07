import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import Button from '../../UI/Button';
import Textarea from '../../UI/Textarea';
import { formatPrice } from './orderUtils';

export default function OrderRefundModal({ order, open, onClose }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative admin-card w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Refund</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                        <X size={18} />
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                    Remaining refundable: <strong className="text-slate-800 dark:text-slate-100">{formatPrice(order.refundable_remaining)}</strong>
                </p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.target);
                        router.post(`/admin/orders/${order.id}/partial-refund`, Object.fromEntries(fd), {
                            preserveScroll: true,
                            onSuccess: onClose,
                        });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            max={order.refundable_remaining}
                            className="input-premium w-full"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <Textarea name="note" rows={3} placeholder="Refund reason (optional)" />
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="flex-1">Record Refund</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
