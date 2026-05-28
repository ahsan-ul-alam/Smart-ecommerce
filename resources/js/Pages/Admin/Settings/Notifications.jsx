import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function Notifications({ settings }) {
    const { data, setData, put, processing } = useForm({
        settings: {
            email_order_confirmation: settings.email_order_confirmation ?? true,
            sms_order_confirmation: settings.sms_order_confirmation ?? true,
            abandoned_cart_email: settings.abandoned_cart_email ?? true,
            abandoned_cart_sms: settings.abandoned_cart_sms ?? false,
        },
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/settings/notifications');
    };

    const toggle = (key) => setData('settings', { ...data.settings, [key]: !data.settings[key] });

    return (
        <AdminLayout title="Notification Settings">
            <FlashMessage />

            <Card className="max-w-2xl">
                <CardHeader title="Email & SMS toggles" subtitle="Requires configured integrations under Settings → Email / SMS" />
                <CardBody>
                    <form onSubmit={submit} className="space-y-4">
                        {[
                            ['email_order_confirmation', 'Order confirmation email'],
                            ['sms_order_confirmation', 'Order confirmation SMS'],
                            ['abandoned_cart_email', 'Abandoned cart recovery email'],
                            ['abandoned_cart_sms', 'Abandoned cart recovery SMS'],
                            ['low_stock_alert', 'Daily low stock email (to store email)'],
                        ].map(([key, label]) => (
                            <label key={key} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={!!data.settings[key]}
                                    onChange={() => toggle(key)}
                                    className="rounded"
                                />
                            </label>
                        ))}
                        <Button type="submit" loading={processing}>Save notification settings</Button>
                    </form>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
