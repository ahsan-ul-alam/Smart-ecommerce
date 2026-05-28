import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function Login() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            <Card className="w-full max-w-md">
                <CardHeader title={t('auth.login')} subtitle="ArCommerze Admin & Shop" />
                <CardBody>
                    <form onSubmit={submit} className="space-y-4">
                        <Input
                            label={t('auth.email')}
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            autoComplete="email"
                            required
                        />
                        <Input
                            label={t('auth.password')}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            autoComplete="current-password"
                            required
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            {t('auth.remember')}
                        </label>
                        <Button type="submit" loading={processing} className="w-full">
                            {t('auth.login')}
                        </Button>
                    </form>
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-center text-sm text-slate-500 mb-3">Or continue with</p>
                        <div className="flex gap-3">
                            <a href="/auth/google/redirect" className="flex-1 text-center py-2 border rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Google</a>
                            <a href="/auth/facebook/redirect" className="flex-1 text-center py-2 border rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Facebook</a>
                        </div>
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        {t('auth.no_account')}{' '}
                        <Link href="/register" className="text-teal-700 font-medium hover:underline">
                            {t('auth.register')}
                        </Link>
                    </p>
                </CardBody>
            </Card>
        </GuestLayout>
    );
}
