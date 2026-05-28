import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function MiniCartDrawer({ open, onClose }) {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        fetch('/shop/cart/drawer', { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => r.json())
            .then((data) => { setCart(data.cart); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (open) load();
    }, [open]);

    const updateQty = (itemId, quantity) => {
        router.patch(`/shop/cart/${itemId}`, { quantity }, {
            preserveScroll: true,
            onSuccess: load,
        });
    };

    const removeItem = (itemId) => {
        router.delete(`/shop/cart/${itemId}`, { preserveScroll: true, onSuccess: load });
    };

    if (!open) return null;

    const items = cart?.items ?? [];

    return (
        <div className="fixed inset-0 z-[60]">
            <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-label="Close cart" />
            <aside className="absolute right-0 top-0 h-full w-full max-w-md glass shadow-2xl flex flex-col animate-[slideIn_0.25s_ease-out]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingCart size={20} /> Your cart
                    </h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {loading && <p className="text-sm text-slate-500 text-center py-8">Loading cart…</p>}
                    {!loading && items.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-12">Your cart is empty.</p>
                    )}
                    {!loading && items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/40">
                            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl font-bold">
                                        {item.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                                <p className="text-sm font-semibold text-primary mt-1">{formatPrice(item.line_total)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button type="button" onClick={() => updateQty(item.id, Math.max(0, item.quantity - 1))} className="p-1 rounded-lg border">
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                                    <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 rounded-lg border">
                                        <Plus size={14} />
                                    </button>
                                    <button type="button" onClick={() => removeItem(item.id)} className="ml-auto p-1 text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length > 0 && (
                    <div className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatPrice(cart?.total ?? 0)}</span>
                        </div>
                        <Link
                            href="/shop/checkout"
                            className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-teal-800 transition-premium"
                            onClick={onClose}
                        >
                            Checkout
                        </Link>
                        <Link href="/shop/cart" className="block text-center text-sm text-slate-500 hover:text-primary" onClick={onClose}>
                            View full cart
                        </Link>
                    </div>
                )}
            </aside>
        </div>
    );
}
