import { router } from '@inertiajs/react';
import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import Button from '../UI/Button';

export default function CampaignPopup({ campaign }) {
    const [open, setOpen] = useState(true);
    const [copied, setCopied] = useState(false);

    if (!campaign || !open) {
        return null;
    }

    const dismiss = () => {
        setOpen(false);
        router.post(`/shop/campaigns/${campaign.id}/dismiss`, { hours: campaign.dismiss_hours ?? 24 }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const copyCode = async () => {
        if (!campaign.coupon_code) return;
        await navigator.clipboard.writeText(campaign.coupon_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl glass shadow-[var(--shadow-elevated)] overflow-hidden animate-in fade-in zoom-in-95">
                <button
                    type="button"
                    onClick={dismiss}
                    className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/60 z-10"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                {campaign.image && (
                    <img src={campaign.image} alt="" className="w-full h-40 object-cover" />
                )}

                <div className="p-6">
                    {campaign.title && (
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white pr-8">{campaign.title}</h2>
                    )}
                    {campaign.body && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{campaign.body}</p>
                    )}

                    {campaign.coupon_code && (
                        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                            <span className="font-mono font-bold text-primary flex-1">{campaign.coupon_code}</span>
                            <button type="button" onClick={copyCode} className="p-2 rounded-lg hover:bg-white/60">
                                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                            </button>
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                        {campaign.cta_url && (
                            <a href={campaign.cta_url} className="flex-1 min-w-[120px]">
                                <Button className="w-full">{campaign.cta_label || 'Shop now'}</Button>
                            </a>
                        )}
                        <Button type="button" variant="secondary" onClick={dismiss} className={campaign.cta_url ? '' : 'w-full'}>
                            Maybe later
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
