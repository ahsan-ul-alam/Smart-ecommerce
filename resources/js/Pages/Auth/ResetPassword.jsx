import { useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function ResetPassword({ email, token }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <GuestLayout>
            <Card glass className="w-full max-w-md shadow-[var(--shadow-elevated)]">
                <CardHeader title="Reset password" subtitle="Choose a new password" />
                <CardBody>
                    <form onSubmit={submit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            autoComplete="email"
                            required
                        />
                        <Input
                            label="New password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            autoComplete="new-password"
                            required
                        />
                        <Input
                            label="Confirm password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            autoComplete="new-password"
                            required
                        />
                        <Button type="submit" loading={processing} className="w-full">
                            Reset password
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </GuestLayout>
    );
}
