import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

export default function Theme({ settings }) {
    const { data, setData, put, processing } = useForm({
        settings: {
            primary_color: settings.primary_color ?? '#0f766e',
            secondary_color: settings.secondary_color ?? '#f59e0b',
            logo: settings.logo ?? '',
            favicon: settings.favicon ?? '',
            dark_mode_default: settings.dark_mode_default ?? false,
        },
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/settings/theme');
    };

    return (
        <AdminLayout title="Theme">
            <FlashMessage />

            <Card className="max-w-2xl">
                <CardHeader title="Branding" subtitle="Colors apply as CSS variables across shop and admin" />
                <CardBody>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input label="Primary color" type="color" value={data.settings.primary_color} onChange={(e) => setData('settings', { ...data.settings, primary_color: e.target.value })} />
                                <Input className="mt-1 font-mono text-xs" value={data.settings.primary_color} onChange={(e) => setData('settings', { ...data.settings, primary_color: e.target.value })} />
                            </div>
                            <div>
                                <Input label="Secondary color" type="color" value={data.settings.secondary_color} onChange={(e) => setData('settings', { ...data.settings, secondary_color: e.target.value })} />
                                <Input className="mt-1 font-mono text-xs" value={data.settings.secondary_color} onChange={(e) => setData('settings', { ...data.settings, secondary_color: e.target.value })} />
                            </div>
                        </div>
                        <Input label="Logo URL" value={data.settings.logo || ''} onChange={(e) => setData('settings', { ...data.settings, logo: e.target.value })} />
                        <Input label="Favicon URL" value={data.settings.favicon || ''} onChange={(e) => setData('settings', { ...data.settings, favicon: e.target.value })} />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={data.settings.dark_mode_default} onChange={(e) => setData('settings', { ...data.settings, dark_mode_default: e.target.checked })} className="rounded" />
                            Default to dark mode for new visitors
                        </label>
                        <Button type="submit" loading={processing}>Save theme</Button>
                    </form>
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
