import { Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const resend = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <GuestLayout>
            <Card glass className="w-full max-w-md">
                <CardHeader title="Verify your email" subtitle="Check your inbox for the verification link" />
                <CardBody className="space-y-4">
                    {status === 'verification-link-sent' && (
                        <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                            A new verification link has been sent to your email address.
                        </p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Before continuing, please verify your email. If you did not receive the email, you can request another.
                    </p>
                    <form onSubmit={resend}>
                        <Button type="submit" loading={processing} className="w-full">
                            Resend verification email
                        </Button>
                    </form>
                    <Link href="/logout" method="post" as="button" className="block w-full text-center text-sm text-slate-500 hover:text-teal-700">
                        Log out
                    </Link>
                </CardBody>
            </Card>
        </GuestLayout>
    );
}
