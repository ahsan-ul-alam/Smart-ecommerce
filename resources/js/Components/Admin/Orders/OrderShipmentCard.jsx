import { router, useForm } from '@inertiajs/react';
import { ExternalLink, RefreshCw, Truck } from 'lucide-react';
import clsx from 'clsx';
import Button from '../../UI/Button';
import Select from '../../UI/Select';
import Badge from '../../UI/Badge';
import { courierColors, initials } from './orderUtils';

export default function OrderShipmentCard({ order, couriers = [], id = 'shipment-card' }) {
    const shipmentForm = useForm({ courier: couriers[0]?.value ?? 'pathao' });
    const needsShipment = ['packed', 'shipped'].includes(order.status) && !order.shipment;
    const shipment = order.shipment;
    const courierLabel = couriers.find((c) => c.value === shipment?.courier)?.label ?? shipment?.courier;

    if (!needsShipment && !shipment) return null;

    return (
        <div id={id} className="admin-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Shipment</h2>
                {needsShipment && <Badge variant="warning">Required</Badge>}
            </div>
            <div className="p-5">
                {shipment ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                'h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold',
                                courierColors[shipment.courier] ?? 'bg-slate-500',
                            )}>
                                {initials(courierLabel ?? 'C')}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{courierLabel}</p>
                                <Badge variant={shipment.status === 'delivered' ? 'success' : 'info'} className="mt-1">
                                    {shipment.status ?? 'Created'}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Tracking</span>
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                                    {shipment.tracking_id || '—'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            {shipment.tracking_id && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => router.post(`/admin/orders/${order.id}/shipment/sync`, {}, { preserveScroll: true })}
                                >
                                    <RefreshCw size={15} className="inline mr-1.5" />
                                    Sync Tracking
                                </Button>
                            )}
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent((courierLabel ?? '') + ' ' + (shipment.tracking_id ?? ''))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-premium"
                            >
                                <ExternalLink size={15} /> Track Shipment
                            </a>
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            shipmentForm.post(`/admin/orders/${order.id}/shipment`, { preserveScroll: true });
                        }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                            <Truck size={18} className="text-amber-600 shrink-0" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">Assign a courier before marking as shipped.</p>
                        </div>
                        <Select
                            label="Courier"
                            value={shipmentForm.data.courier}
                            onChange={(e) => shipmentForm.setData('courier', e.target.value)}
                            options={couriers}
                        />
                        <Button type="submit" loading={shipmentForm.processing} className="w-full">
                            Create Shipment
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
