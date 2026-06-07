import { Link } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { formatPrice } from './orderUtils';

export default function OrderItemsTable({ items = [] }) {
    return (
        <div className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Order Items</h2>
                <span className="text-xs text-slate-400">{items.length} products</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <th className="px-5 py-3 w-16" />
                            <th className="px-3 py-3">Product</th>
                            <th className="px-3 py-3 hidden md:table-cell">SKU</th>
                            <th className="px-3 py-3 hidden lg:table-cell">Variant</th>
                            <th className="px-3 py-3 text-center">Qty</th>
                            <th className="px-3 py-3 hidden sm:table-cell">Unit</th>
                            <th className="px-5 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {items.map((item) => {
                            const productUrl = item.product_slug
                                ? `/shop/products/${item.product_slug}`
                                : item.product_id
                                    ? `/admin/products/${item.product_id}`
                                    : null;

                            return (
                                <tr key={item.id} className="hover:bg-primary/[0.02] dark:hover:bg-primary/5 transition-premium">
                                    <td className="px-5 py-3">
                                        {productUrl ? (
                                            <Link href={productUrl} target="_blank" className="block">
                                                {item.image ? (
                                                    <img src={item.image} alt="" className="h-11 w-11 rounded-lg object-cover ring-1 ring-slate-200/80 dark:ring-slate-600" />
                                                ) : (
                                                    <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                        <Package size={18} className="text-slate-400" />
                                                    </div>
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                <Package size={18} className="text-slate-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        {productUrl ? (
                                            <Link href={productUrl} target="_blank" className="font-medium text-slate-800 dark:text-slate-100 hover:text-primary transition-premium">
                                                {item.product_name}
                                            </Link>
                                        ) : (
                                            <span className="font-medium text-slate-800 dark:text-slate-100">{item.product_name}</span>
                                        )}
                                        <p className="text-xs text-slate-400 mt-0.5 md:hidden font-mono">{item.product_sku}</p>
                                    </td>
                                    <td className="px-3 py-3 font-mono text-xs text-slate-500 hidden md:table-cell">{item.product_sku}</td>
                                    <td className="px-3 py-3 text-slate-500 hidden lg:table-cell">{item.variant_name || '—'}</td>
                                    <td className="px-3 py-3 text-center font-semibold">{item.quantity}</td>
                                    <td className="px-3 py-3 hidden sm:table-cell text-slate-600 dark:text-slate-300">{formatPrice(item.unit_price)}</td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-white">{formatPrice(item.total)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
