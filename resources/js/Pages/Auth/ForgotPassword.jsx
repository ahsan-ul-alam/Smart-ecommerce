import { Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <GuestLayout>
            <Card glass className="w-full max-w-md shadow-[var(--shadow-elevated)]">
                <CardHeader title="Forgot password" subtitle="We'll email you a reset link" />
                <CardBody>
                    {status && (
                        <p className="mb-4 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                            {status}
                        </p>
                    )}
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
                        <Button type="submit" loading={processing} className="w-full">
                            Send reset link
                        </Button>
                    </form>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        <Link href="/login" className="text-teal-700 font-medium hover:underline">
                            Back to login
                        </Link>
                    </p>
                </CardBody>
            </Card>
        </GuestLayout>
    );
}
