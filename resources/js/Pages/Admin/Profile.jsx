import { useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import FlashMessage from '../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function Profile({ profile }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch('/admin/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setData('current_password', '');
                setData('password', '');
                setData('password_confirmation', '');
            },
        });
    };

    return (
        <AdminLayout title="My profile">
            <FlashMessage />

            <div className="max-w-2xl">
                <p className="text-sm text-slate-500 mb-6">
                    Update your account details and password. Role:{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {(profile.roles ?? []).join(', ').replace(/_/g, ' ') || 'Admin'}
                    </span>
                </p>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader title="Account details" subtitle="Name and contact information" />
                        <CardBody className="space-y-4">
                            <Input
                                label="Full name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />
                            <Input
                                label="Phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                                placeholder="01XXXXXXXXX"
                            />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Change password" subtitle="Leave blank to keep your current password" />
                        <CardBody className="space-y-4">
                            <Input
                                label="Current password"
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                error={errors.current_password}
                                autoComplete="current-password"
                            />
                            <Input
                                label="New password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                autoComplete="new-password"
                            />
                            <Input
                                label="Confirm new password"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                autoComplete="new-password"
                            />
                        </CardBody>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" loading={processing}>Save changes</Button>
                        {recentlySuccessful && (
                            <span className="text-sm text-emerald-600 font-medium">Saved.</span>
                        )}
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
