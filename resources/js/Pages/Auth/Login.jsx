import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Shield, Store, Mail, Phone, ArrowRight, LayoutDashboard, Lock,
} from 'lucide-react';
import clsx from 'clsx';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import FlashMessage from '../../Components/UI/FlashMessage';
import LanguageSwitcher from '../../Components/UI/LanguageSwitcher';
import ThemeToggle from '../../Components/UI/ThemeToggle';
import ApplyThemeBranding from '../../Components/ApplyThemeBranding';

export default function Login({ status, portal = 'shop' }) {
    const { t } = useTranslation();
    const { app, theme = {} } = usePage().props;
    const isAdmin = portal === 'admin';
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

    const formErrors = mode === 'email'
        ? Object.values(emailForm.errors).filter(Boolean)
        : [...Object.values(otpForm.errors), ...Object.values(sendForm.errors)].filter(Boolean);

    return (
        <GuestLayout variant="split">
            <ApplyThemeBranding />
            <FlashMessage />

            <div className="min-h-screen grid lg:grid-cols-2">
                <div
                    className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 text-white overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, color-mix(in srgb, var(--color-brand-primary) 70%, #1e293b) 100%)',
                    }}
                >
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
                    </div>

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3">
                            {theme.logo ? (
                                <img src={theme.logo} alt={app?.name} className="h-10 w-auto max-w-[180px] object-contain brightness-0 invert" />
                            ) : (
                                <span className="text-2xl font-bold tracking-tight">{app?.name || 'ArCommerze'}</span>
                            )}
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-md">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-6">
                            {isAdmin ? <LayoutDashboard size={14} /> : <Store size={14} />}
                            {isAdmin ? 'Admin Portal' : 'Customer Account'}
                        </div>
                        <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                            {isAdmin ? 'Sign in to manage your store' : 'Welcome back'}
                        </h1>
                        <p className="mt-4 text-white/80 text-sm leading-relaxed">
                            {isAdmin
                                ? 'Access orders, products, customers, and store settings from one secure dashboard.'
                                : 'Track orders, manage your wishlist, and checkout faster with your account.'}
                        </p>

                        <ul className="mt-8 space-y-3 text-sm text-white/90">
                            {(isAdmin
                                ? ['Order & shipment management', 'Product catalog & inventory', 'Reports and store settings']
                                : ['Order history & tracking', 'Saved addresses', 'Rewards and wishlist']
                            ).map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <Shield size={16} className="shrink-0 opacity-80" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="relative z-10 text-xs text-white/60">
                        &copy; {new Date().getFullYear()} {app?.name || 'ArCommerze'}. All rights reserved.
                    </p>
                </div>

                <div className="flex flex-col min-h-screen">
                    <header className="flex items-center justify-between gap-4 p-5 sm:p-6 lg:p-8">
                        <Link href="/" className="lg:hidden inline-flex items-center">
                            {theme.logo ? (
                                <img src={theme.logo} alt={app?.name} className="h-9 w-auto max-w-[160px] object-contain" />
                            ) : (
                                <span className="text-xl font-bold text-primary">{app?.name || 'ArCommerze'}</span>
                            )}
                        </Link>
                        <div className="flex items-center gap-1 ml-auto">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>
                    </header>

                    <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                                    {isAdmin ? 'Admin sign in' : 'Sign in'}
                                </p>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {isAdmin ? 'Access admin dashboard' : 'Sign in to your account'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {isAdmin
                                        ? 'Use your staff credentials to continue.'
                                        : 'Enter your email or phone to continue.'}
                                </p>
                            </div>

                            {status && (
                                <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 px-4 py-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                                    {status}
                                </p>
                            )}

                            {formErrors.length > 0 && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                    {formErrors[0]}
                                </div>
                            )}

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 mb-5">
                                    <button
                                        type="button"
                                        onClick={() => setMode('email')}
                                        className={clsx(
                                            'flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg transition-colors',
                                            mode === 'email'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                : 'text-slate-500',
                                        )}
                                    >
                                        <Mail size={15} />
                                        Email
                                    </button>
                                    {!isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => setMode('phone')}
                                            className={clsx(
                                                'flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg transition-colors',
                                                mode === 'phone'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-500',
                                            )}
                                        >
                                            <Phone size={15} />
                                            Phone OTP
                                        </button>
                                    )}
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
                                            <div className="mt-1.5 text-right">
                                                <Link href="/forgot-password" className="text-xs text-primary font-medium hover:underline">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <input
                                                type="checkbox"
                                                checked={emailForm.data.remember}
                                                onChange={(e) => emailForm.setData('remember', e.target.checked)}
                                                className="rounded border-slate-300 text-primary"
                                            />
                                            {t('auth.remember')}
                                        </label>
                                        <Button type="submit" loading={emailForm.processing} className="w-full" size="lg">
                                            <Lock size={16} />
                                            {isAdmin ? 'Sign in to admin' : t('auth.login')}
                                            <ArrowRight size={16} />
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
                                        <div className="flex gap-2 items-end">
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
                                                className="shrink-0 mb-0.5"
                                            >
                                                Send code
                                            </Button>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <input
                                                type="checkbox"
                                                checked={otpForm.data.remember}
                                                onChange={(e) => otpForm.setData('remember', e.target.checked)}
                                                className="rounded border-slate-300 text-primary"
                                            />
                                            {t('auth.remember')}
                                        </label>
                                        <Button type="submit" loading={otpForm.processing} className="w-full" size="lg">
                                            Sign in with OTP
                                            <ArrowRight size={16} />
                                        </Button>
                                    </form>
                                )}
                            </div>

                            {!isAdmin && (
                                <>
                                    <div className="mt-6">
                                        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                                            Or continue with
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <a
                                                href="/auth/google/redirect"
                                                className="text-center py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                Google
                                            </a>
                                            <a
                                                href="/auth/facebook/redirect"
                                                className="text-center py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                Facebook
                                            </a>
                                        </div>
                                    </div>

                                    <p className="text-center text-sm text-slate-500 mt-6">
                                        {t('auth.no_account')}{' '}
                                        <Link href="/register" className="text-primary font-semibold hover:underline">
                                            {t('auth.register')}
                                        </Link>
                                    </p>
                                </>
                            )}

                            <p className="text-center text-sm text-slate-500 mt-6">
                                {isAdmin ? (
                                    <>
                                        <Link href="/" className="text-primary font-medium hover:underline">Back to storefront</Link>
                                        {' · '}
                                        <Link href="/login" className="text-primary font-medium hover:underline">Customer login</Link>
                                    </>
                                ) : (
                                    <>
                                        Staff member?{' '}
                                        <Link href="/login?portal=admin" className="text-primary font-semibold hover:underline">
                                            Admin login
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
