import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function Site({ settings, logo_url, favicon_url }) {
    const { t } = useTranslation();
    const logoRef = useRef(null);
    const faviconRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(logo_url);
    const [faviconPreview, setFaviconPreview] = useState(favicon_url);

    useEffect(() => {
        setLogoPreview(logo_url);
        setFaviconPreview(favicon_url);
    }, [logo_url, favicon_url]);

    const { data, setData, post, processing, errors, transform } = useForm({
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
            primary_color: settings.primary_color ?? '#0f766e',
            secondary_color: settings.secondary_color ?? '#f59e0b',
            dark_mode_default: settings.dark_mode_default ?? false,
        },
        logo: null,
        favicon: null,
        remove_logo: false,
        remove_favicon: false,
    });

    transform((formData) => ({
        ...formData,
        _method: 'put',
    }));

    const onLogoChange = (e) => {
        const file = e.target.files?.[0];
        setData('logo', file ?? null);
        setData('remove_logo', false);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const onFaviconChange = (e) => {
        const file = e.target.files?.[0];
        setData('favicon', file ?? null);
        setData('remove_favicon', false);
        if (file) {
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setData('remove_logo', true);
        setLogoPreview(null);
        if (logoRef.current) logoRef.current.value = '';
    };

    const removeFavicon = () => {
        setData('favicon', null);
        setData('remove_favicon', true);
        setFaviconPreview(null);
        if (faviconRef.current) faviconRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings/general', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('logo', null);
                setData('favicon', null);
                setData('remove_logo', false);
                setData('remove_favicon', false);
            },
        });
    };

    return (
        <AdminLayout title="Site settings">
            <FlashMessage />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Card>
                    <CardHeader title="Store identity" subtitle="Name and contact details appear on receipts, invoices, and the storefront" />
                    <CardBody className="space-y-4">
                        <Input
                            label="Site name"
                            value={data.settings.site_name}
                            onChange={(e) => setData('settings', { ...data.settings, site_name: e.target.value })}
                            error={errors['settings.site_name']}
                            required
                        />
                        <Input
                            label="Tagline"
                            value={data.settings.site_tagline}
                            onChange={(e) => setData('settings', { ...data.settings, site_tagline: e.target.value })}
                        />
                        <Input
                            label="Store phone"
                            value={data.settings.store_phone}
                            onChange={(e) => setData('settings', { ...data.settings, store_phone: e.target.value })}
                        />
                        <Input
                            label="Store email"
                            type="email"
                            value={data.settings.store_email}
                            onChange={(e) => setData('settings', { ...data.settings, store_email: e.target.value })}
                        />
                        <Input
                            label="Store address"
                            value={data.settings.store_address}
                            onChange={(e) => setData('settings', { ...data.settings, store_address: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Currency"
                                value={data.settings.currency}
                                onChange={(e) => setData('settings', { ...data.settings, currency: e.target.value })}
                            />
                            <Input
                                label="Symbol"
                                value={data.settings.currency_symbol}
                                onChange={(e) => setData('settings', { ...data.settings, currency_symbol: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Timezone"
                            value={data.settings.timezone}
                            onChange={(e) => setData('settings', { ...data.settings, timezone: e.target.value })}
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.settings.maintenance_mode}
                                onChange={(e) => setData('settings', { ...data.settings, maintenance_mode: e.target.checked })}
                                className="rounded"
                            />
                            Maintenance mode
                        </label>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Branding & theme" subtitle="Logo, favicon, and colors apply across shop, admin, and login pages" />
                    <CardBody className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Logo</p>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="h-14 w-auto max-w-full object-contain mb-3 rounded border border-slate-200 dark:border-slate-600 p-2 bg-white" />
                                ) : (
                                    <p className="text-xs text-slate-500 mb-3">No logo — site name is shown instead.</p>
                                )}
                                <input ref={logoRef} type="file" accept="image/*" onChange={onLogoChange} className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-800" />
                                {errors.logo && <p className="text-xs text-red-600 mt-1">{errors.logo}</p>}
                                {logoPreview && (
                                    <button type="button" onClick={removeLogo} className="mt-2 text-xs text-red-600 hover:underline">
                                        Remove logo
                                    </button>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Favicon</p>
                                {faviconPreview ? (
                                    <img src={faviconPreview} alt="Favicon preview" className="h-10 w-10 object-contain mb-3 rounded border border-slate-200 dark:border-slate-600 p-1 bg-white" />
                                ) : (
                                    <p className="text-xs text-slate-500 mb-3">No favicon uploaded.</p>
                                )}
                                <input ref={faviconRef} type="file" accept="image/*,.ico" onChange={onFaviconChange} className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-800" />
                                {errors.favicon && <p className="text-xs text-red-600 mt-1">{errors.favicon}</p>}
                                {faviconPreview && (
                                    <button type="button" onClick={removeFavicon} className="mt-2 text-xs text-red-600 hover:underline">
                                        Remove favicon
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Primary color"
                                    type="color"
                                    value={data.settings.primary_color}
                                    onChange={(e) => setData('settings', { ...data.settings, primary_color: e.target.value })}
                                />
                                <Input
                                    className="mt-1 font-mono text-xs"
                                    value={data.settings.primary_color}
                                    onChange={(e) => setData('settings', { ...data.settings, primary_color: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Secondary color"
                                    type="color"
                                    value={data.settings.secondary_color}
                                    onChange={(e) => setData('settings', { ...data.settings, secondary_color: e.target.value })}
                                />
                                <Input
                                    className="mt-1 font-mono text-xs"
                                    value={data.settings.secondary_color}
                                    onChange={(e) => setData('settings', { ...data.settings, secondary_color: e.target.value })}
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.settings.dark_mode_default}
                                onChange={(e) => setData('settings', { ...data.settings, dark_mode_default: e.target.checked })}
                                className="rounded"
                            />
                            Default to dark mode for new visitors
                        </label>

                        <p className="text-xs text-slate-500">
                            Run <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">php artisan storage:link</code> once so uploaded images are publicly visible.
                        </p>
                    </CardBody>
                </Card>

                <Button type="submit" loading={processing}>{t('settings.save')}</Button>
            </form>
        </AdminLayout>
    );
}
