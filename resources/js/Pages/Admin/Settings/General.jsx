import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function General({ settings }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        settings: {
            site_name: settings.site_name ?? '',
            site_tagline: settings.site_tagline ?? '',
            store_phone: settings.store_phone ?? '',
            store_email: settings.store_email ?? '',
            store_address: settings.store_address ?? '',
            currency: settings.currency ?? 'BDT',
            currency_symbol: settings.currency_symbol ?? '৳',
            timezone: settings.timezone ?? 'Asia/Dhaka',
            maintenance_mode: settings.maintenance_mode ?? false,
        },
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/settings/general');
    };

    return (
        <AdminLayout title={t('settings.general')}>
            <Card className="max-w-2xl">
                <CardHeader title={t('settings.general')} />
                <CardBody>
                    <form onSubmit={submit} className="space-y-4">
                        <Input label="Site Name" value={data.settings.site_name} onChange={(e) => setData('settings', { ...data.settings, site_name: e.target.value })} error={errors['settings.site_name']} />
                        <Input label="Tagline" value={data.settings.site_tagline} onChange={(e) => setData('settings', { ...data.settings, site_tagline: e.target.value })} />
                        <Input label="Store phone" value={data.settings.store_phone} onChange={(e) => setData('settings', { ...data.settings, store_phone: e.target.value })} />
                        <Input label="Store email" type="email" value={data.settings.store_email} onChange={(e) => setData('settings', { ...data.settings, store_email: e.target.value })} />
                        <Input label="Store address" value={data.settings.store_address} onChange={(e) => setData('settings', { ...data.settings, store_address: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Currency" value={data.settings.currency} onChange={(e) => setData('settings', { ...data.settings, currency: e.target.value })} />
                            <Input label="Symbol" value={data.settings.currency_symbol} onChange={(e) => setData('settings', { ...data.settings, currency_symbol: e.target.value })} />
                        </div>
                        <Input label="Timezone" value={data.settings.timezone} onChange={(e) => setData('settings', { ...data.settings, timezone: e.target.value })} />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={data.settings.maintenance_mode} onChange={(e) => setData('settings', { ...data.settings, maintenance_mode: e.target.checked })} className="rounded" />
                            Maintenance Mode
                        </label>
                        <Button type="submit" loading={processing}>{t('settings.save')}</Button>
                    </form>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
