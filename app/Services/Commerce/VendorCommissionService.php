<?php

namespace App\Services\Commerce;

use App\Models\Order;
use App\Models\VendorCommission;
use App\Services\Modules\ModuleService;
class VendorCommissionService
{
    public function __construct(
        protected ModuleService $modules,
    ) {}

    public function isEnabled(): bool
    {
        return $this->modules->isEnabled('vendor');
    }

    public function recordForOrder(Order $order): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        $order->loadMissing(['items.product.vendor']);

        $byVendor = $order->items
            ->filter(fn ($item) => $item->product?->vendor_id)
            ->groupBy(fn ($item) => $item->product->vendor_id);

        foreach ($byVendor as $vendorId => $items) {
            $vendor = $items->first()->product->vendor;

            if (! $vendor || ! $vendor->is_active) {
                continue;
            }

            $lineTotal = $items->sum(fn ($item) => (float) $item->total);
            $rate = (float) $vendor->commission_rate;
            $amount = round($lineTotal * ($rate / 100), 2);

            VendorCommission::query()->updateOrCreate(
                [
                    'vendor_id' => $vendorId,
                    'order_id' => $order->id,
                ],
                [
                    'line_total' => $lineTotal,
                    'commission_rate' => $rate,
                    'commission_amount' => $amount,
                    'status' => 'pending',
                ]
            );
        }
    }
}
