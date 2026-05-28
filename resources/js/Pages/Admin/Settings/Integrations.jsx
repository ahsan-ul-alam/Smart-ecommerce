import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Settings } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import clsx from 'clsx';

const credentialFields = {
    bkash: [
        { key: 'app_key', label: 'App Key' },
        { key: 'app_secret', label: 'App Secret', secret: true },
        { key: 'username', label: 'Username' },
        { key: 'password', label: 'Password', secret: true },
    ],
    pathao: [
        { key: 'client_id', label: 'Client ID' },
        { key: 'client_secret', label: 'Client Secret', secret: true },
        { key: 'username', label: 'Username' },
        { key: 'password', label: 'Password', secret: true },
        { key: 'store_id', label: 'Store ID' },
        { key: 'zone_id', label: 'Zone ID' },
        { key: 'area_id', label: 'Area ID' },
    ],
    paperfly: [
        { key: 'merchant_code', label: 'Merchant Code' },
        { key: 'api_key', label: 'API Key', secret: true },
    ],
    ecourier: [
        { key: 'user_id', label: 'User ID' },
        { key: 'api_key', label: 'API Key', secret: true },
    ],
    stripe: [
        { key: 'secret_key', label: 'Secret Key', secret: true },
        { key: 'currency', label: 'Currency (bdt/usd)' },
    ],
    paypal: [
        { key: 'client_id', label: 'Client ID' },
        { key: 'client_secret', label: 'Client Secret', secret: true },
        { key: 'currency', label: 'Currency (USD)' },
    ],
    steadfast: [
        { key: 'api_key', label: 'API Key', secret: true },
        { key: 'secret_key', label: 'Secret Key', secret: true },
    ],
    sslcommerz: [
        { key: 'store_id', label: 'Store ID' },
        { key: 'store_password', label: 'Store Password', secret: true },
    ],
    aamarpay: [
        { key: 'store_id', label: 'Store ID' },
        { key: 'signature_key', label: 'Signature Key', secret: true },
    ],
    redx: [
        { key: 'api_token', label: 'API Token', secret: true },
    ],
    nagad: [
        { key: 'merchant_id', label: 'Merchant ID' },
        { key: 'merchant_number', label: 'Merchant Number' },
        { key: 'public_key', label: 'Public Key' },
        { key: 'private_key', label: 'Private Key', secret: true },
    ],
    bulksmsbd: [
        { key: 'api_key', label: 'API Key', secret: true },
        { key: 'sender_id', label: 'Sender ID' },
    ],
    twilio: [
        { key: 'account_sid', label: 'Account SID' },
        { key: 'auth_token', label: 'Auth Token', secret: true },
        { key: 'from_number', label: 'From Number' },
    ],
    greenweb: [
        { key: 'token', label: 'API Token', secret: true },
    ],
    smtp: [
        { key: 'host', label: 'SMTP Host' },
        { key: 'port', label: 'Port' },
        { key: 'username', label: 'Username' },
        { key: 'password', label: 'Password', secret: true },
        { key: 'encryption', label: 'Encryption (tls/ssl)' },
        { key: 'from_email', label: 'From Email' },
        { key: 'from_name', label: 'From Name' },
    ],
    mailgun: [
        { key: 'domain', label: 'Domain' },
        { key: 'api_key', label: 'API Key', secret: true },
        { key: 'from_email', label: 'From Email' },
    ],
    resend: [
        { key: 'api_key', label: 'API Key', secret: true },
        { key: 'from_email', label: 'From Email' },
    ],
    ses: [
        { key: 'access_key', label: 'Access Key' },
        { key: 'secret_key', label: 'Secret Key', secret: true },
        { key: 'region', label: 'Region (e.g. ap-southeast-1)' },
        { key: 'from_email', label: 'From Email' },
    ],
};

export default function Integrations({ type, integrations }) {
    const [editing, setEditing] = useState(null);
    const form = useForm({ is_enabled: false, is_sandbox: true, credentials: {} });

    const openEdit = (integration) => {
        setEditing(integration.id);
        form.setData({
            is_enabled: integration.is_enabled,
            is_sandbox: integration.is_sandbox,
            credentials: {},
        });
    };

    const submit = (e) => {
        e.preventDefault();
        form.patch(`/admin/integrations/${editing}`, { onSuccess: () => setEditing(null) });
    };

    const fields = credentialFields[integrations.find((i) => i.id === editing)?.provider] || [];

    return (
        <AdminLayout title={`Integrations — ${type}`}>
            <FlashMessage />

            <div className="grid gap-4 max-w-3xl">
                {integrations.map((integration) => (
                    <Card key={integration.id}>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        <Settings size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{integration.label}</p>
                                        <p className="text-xs text-slate-400">{integration.provider}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={integration.is_sandbox ? 'warning' : 'success'}>
                                        {integration.is_sandbox ? 'Sandbox' : 'Live'}
                                    </Badge>
                                    <Badge variant={integration.is_enabled ? 'success' : 'default'}>
                                        {integration.is_enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.post(`/admin/integrations/${integration.id}/test`, {}, { preserveScroll: true })}
                                    >
                                        Test
                                    </Button>
                                    <Button variant="secondary" onClick={() => openEdit(integration)}>Configure</Button>
                                </div>
                            </div>

                            {editing === integration.id && (
                                <form onSubmit={submit} className="mt-4 pt-4 border-t space-y-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={form.data.is_enabled} onChange={(e) => form.setData('is_enabled', e.target.checked)} className="rounded" />
                                        Enable integration
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={form.data.is_sandbox} onChange={(e) => form.setData('is_sandbox', e.target.checked)} className="rounded" />
                                        Sandbox mode
                                    </label>
                                    {fields.map((field) => (
                                        <Input
                                            key={field.key}
                                            label={field.label}
                                            type={field.secret ? 'password' : 'text'}
                                            placeholder={field.secret ? 'Leave blank to keep current' : ''}
                                            value={form.data.credentials[field.key] || ''}
                                            onChange={(e) => form.setData('credentials', { ...form.data.credentials, [field.key]: e.target.value })}
                                        />
                                    ))}
                                    <div className="flex gap-2">
                                        <Button type="submit" loading={form.processing}>Save</Button>
                                        <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                                    </div>
                                </form>
                            )}
                        </CardBody>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
