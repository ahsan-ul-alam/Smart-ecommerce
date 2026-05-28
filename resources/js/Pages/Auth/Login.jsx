import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function Login({ status }) {
    const { t } = useTranslation();
    const [mode, setMode] = useState('email');
    const emailForm = useForm({ email: '', password: '', remember: false });
    const otpForm = useForm({ phone: '', code: '', remember: false });
    const sendForm = useForm({ phone: '' });

    const submitEmail = (e) => {
        e.preventDefault();
        emailForm.post('/login');
    };

    const sendOtp = (e) => {
        e.preventDefault();
        sendForm.setData('phone', otpForm.data.phone);
        sendForm.post('/otp/send', { preserveScroll: true });
    };

    const submitOtp = (e) => {
        e.preventDefault();
        otpForm.post('/otp/login');
    };

    return (
        <GuestLayout>
            <Card glass className="w-full max-w-md shadow-[var(--shadow-elevated)]">
                <CardHeader title={t('auth.login')} subtitle="Sign in to your account" />
                <CardBody>
                    {status && (
                        <p className="mb-4 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                            {status}
                        </p>
                    )}

                    <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-5">
                        <button
                            type="button"
                            onClick={() => setMode('email')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-premium ${mode === 'email' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('phone')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-premium ${mode === 'phone' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            Phone OTP
                        </button>
                    </div>

                    {mode === 'email' ? (
                        <form onSubmit={submitEmail} className="space-y-4">
                            <Input
                                label={t('auth.email')}
                                type="email"
                                value={emailForm.data.email}
                                onChange={(e) => emailForm.setData('email', e.target.value)}
                                error={emailForm.errors.email}
                                autoComplete="email"
                                required
                            />
                            <div>
                                <Input
                                    label={t('auth.password')}
                                    type="password"
                                    value={emailForm.data.password}
                                    onChange={(e) => emailForm.setData('password', e.target.value)}
                                    error={emailForm.errors.password}
                                    autoComplete="current-password"
                                    required
                                />
                                <div className="mt-1 text-right">
                                    <Link href="/forgot-password" className="text-xs text-teal-700 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={emailForm.data.remember}
                                    onChange={(e) => emailForm.setData('remember', e.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                {t('auth.remember')}
                            </label>
                            <Button type="submit" loading={emailForm.processing} className="w-full">
                                {t('auth.login')}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={submitOtp} className="space-y-4">
                            <Input
                                label="Phone number"
                                type="tel"
                                value={otpForm.data.phone}
                                onChange={(e) => otpForm.setData('phone', e.target.value)}
                                error={otpForm.errors.phone || sendForm.errors.phone}
                                placeholder="01XXXXXXXXX"
                                required
                            />
                            <div className="flex gap-2">
                                <Input
                                    label="6-digit code"
                                    value={otpForm.data.code}
                                    onChange={(e) => otpForm.setData('code', e.target.value)}
                                    error={otpForm.errors.code}
                                    maxLength={6}
                                    className="flex-1"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    loading={sendForm.processing}
                                    onClick={sendOtp}
                                    className="self-end mb-0.5 shrink-0"
                                >
                                    Send code
                                </Button>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={otpForm.data.remember}
                                    onChange={(e) => otpForm.setData('remember', e.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                {t('auth.remember')}
                            </label>
                            <Button type="submit" loading={otpForm.processing} className="w-full">
                                Sign in with OTP
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-center text-sm text-slate-500 mb-3">Or continue with</p>
                        <div className="flex gap-3">
                            <a href="/auth/google/redirect" className="flex-1 text-center py-2.5 glass rounded-xl text-sm font-medium hover:bg-white/90 transition-premium">Google</a>
                            <a href="/auth/facebook/redirect" className="flex-1 text-center py-2.5 glass rounded-xl text-sm font-medium hover:bg-white/90 transition-premium">Facebook</a>
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
