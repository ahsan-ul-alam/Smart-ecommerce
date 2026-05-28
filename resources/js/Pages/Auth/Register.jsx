import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function Register({ referral_code: initialRef = '' }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        locale: 'en',
        referral_code: initialRef,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Card className="w-full max-w-md">
                <CardHeader title={t('auth.register')} />
                <CardBody>
                    <form onSubmit={submit} className="space-y-4">
                        <Input label="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                        <Input label={t('auth.email')} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} required />
                        <Input label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                        {data.referral_code && (
                            <Input label="Referral Code" value={data.referral_code} onChange={(e) => setData('referral_code', e.target.value)} error={errors.referral_code} />
                        )}
                        <Input label={t('auth.password')} type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} required />
                        <Input label="Confirm Password" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} error={errors.password_confirmation} required />
                        <Button type="submit" loading={processing} className="w-full">{t('auth.register')}</Button>
                    </form>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        {t('auth.has_account')}{' '}
                        <Link href="/login" className="text-teal-700 font-medium hover:underline">{t('auth.login')}</Link>
                    </p>
                </CardBody>
            </Card>
        </GuestLayout>
    );
}
