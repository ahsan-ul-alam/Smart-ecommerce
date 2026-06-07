import { router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FlashMessage from '../../../Components/UI/FlashMessage';
import OrderDetailHeader from '../../../Components/Admin/Orders/OrderDetailHeader';
import OrderMetricsRow from '../../../Components/Admin/Orders/OrderMetricsRow';
import OrderProgressTimeline from '../../../Components/Admin/Orders/OrderProgressTimeline';
import OrderItemsTable from '../../../Components/Admin/Orders/OrderItemsTable';
import OrderCustomerCard from '../../../Components/Admin/Orders/OrderCustomerCard';
import OrderActivityFeed from '../../../Components/Admin/Orders/OrderActivityFeed';
import OrderInternalNotes from '../../../Components/Admin/Orders/OrderInternalNotes';
import OrderDiscussion from '../../../Components/Admin/Orders/OrderDiscussion';
import OrderSummaryCard from '../../../Components/Admin/Orders/OrderSummaryCard';
import OrderShipmentCard from '../../../Components/Admin/Orders/OrderShipmentCard';
import OrderPaymentCard from '../../../Components/Admin/Orders/OrderPaymentCard';
import OrderQuickActions from '../../../Components/Admin/Orders/OrderQuickActions';
import OrderRefundModal from '../../../Components/Admin/Orders/OrderRefundModal';

export default function OrderShow({
    order,
    workflowSteps = [],
    nextStatuses = [],
    defaultNext = null,
    statuses,
    paymentStatuses,
    couriers = [],
}) {
    const [refundOpen, setRefundOpen] = useState(false);

    const handleHeaderAction = useCallback((action) => {
        switch (action) {
            case 'courier':
                document.getElementById('shipment-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                break;
            case 'sms':
                if (order.customer_phone) {
                    window.open(`sms:${order.customer_phone}?body=${encodeURIComponent(`Regarding your order ${order.order_number}: `)}`, '_blank');
                }
                break;
            case 'refund':
                setRefundOpen(true);
                break;
            case 'return':
                router.patch(`/admin/orders/${order.id}/status`, { status: 'returned' }, { preserveScroll: true });
                break;
            default:
                break;
        }
    }, [order]);

    return (
        <AdminLayout title={`Order ${order.order_number}`}>
            <FlashMessage />

            <div className="space-y-5 sm:space-y-6">
                <OrderDetailHeader order={order} couriers={couriers} onAction={handleHeaderAction} />

                <OrderMetricsRow order={order} couriers={couriers} />

                <OrderProgressTimeline
                    workflowSteps={workflowSteps}
                    currentStatus={order.status}
                    statusLabel={order.status_label}
                    statusHistories={order.status_histories}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                    <div className="lg:col-span-8 space-y-5 sm:space-y-6">
                        <OrderItemsTable items={order.items} />
                        <OrderCustomerCard order={order} />
                        <OrderActivityFeed statusHistories={order.status_histories} />
                        <OrderInternalNotes order={order} />
                        <OrderDiscussion
                            statusHistories={order.status_histories}
                            adminNote={order.admin_note}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-6 space-y-5 sm:space-y-6">
                            <OrderSummaryCard order={order} />
                            <OrderShipmentCard order={order} couriers={couriers} />
                            <OrderPaymentCard
                                order={order}
                                paymentStatuses={paymentStatuses}
                                onRefund={() => setRefundOpen(true)}
                            />
                            <OrderQuickActions
                                order={order}
                                defaultNext={defaultNext}
                                nextStatuses={nextStatuses}
                                statuses={statuses}
                                onAction={handleHeaderAction}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <OrderRefundModal order={order} open={refundOpen} onClose={() => setRefundOpen(false)} />
        </AdminLayout>
    );
}
