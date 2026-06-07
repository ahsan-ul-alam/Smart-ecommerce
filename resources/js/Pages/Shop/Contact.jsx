import { Link, useForm } from '@inertiajs/react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, HelpCircle } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import ShopBreadcrumbs from '../../Components/Shop/ShopBreadcrumbs';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import Textarea from '../../Components/UI/Textarea';
import FlashMessage from '../../Components/UI/FlashMessage';

function ContactCard({ icon: Icon, title, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={18} />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default function Contact({ store = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/shop/contact');
    };

    const hasContactInfo = store.email || store.phone || store.address;

    return (
        <ShopLayout>
            <FlashMessage />

            <ShopBreadcrumbs items={[{ label: 'Contact' }]} />

            <div
                className="rounded-2xl p-6 sm:p-8 mb-8 text-white"
                style={{
                    background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, color-mix(in srgb, var(--color-brand-primary) 75%, #0f172a) 100%)',
                }}
            >
                <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Get in touch</p>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact {store.name || 'us'}</h1>
                    <p className="mt-2 text-sm sm:text-base text-white/85 leading-relaxed">
                        {store.tagline || 'Questions about orders, products, or partnerships? Our team is ready to help.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {hasContactInfo ? (
                        <>
                            {store.email && (
                                <ContactCard icon={Mail} title="Email us">
                                    <a href={`mailto:${store.email}`} className="text-primary font-medium hover:underline break-all">
                                        {store.email}
                                    </a>
                                </ContactCard>
                            )}
                            {store.phone && (
                                <ContactCard icon={Phone} title="Call us">
                                    <a href={`tel:${store.phone}`} className="font-medium hover:text-primary transition-colors">
                                        {store.phone}
                                    </a>
                                </ContactCard>
                            )}
                            {store.address && (
                                <ContactCard icon={MapPin} title="Visit us">
                                    <p className="leading-relaxed">{store.address}</p>
                                </ContactCard>
                            )}
                        </>
                    ) : (
                        <ContactCard icon={MessageSquare} title="Store contact">
                            <p className="text-slate-500">
                                Contact details are not configured yet. You can still send us a message using the form.
                            </p>
                        </ContactCard>
                    )}

                    <ContactCard icon={Clock} title="Response time">
                        <p>We typically reply within 1–2 business days.</p>
                        <p className="mt-1 text-slate-500">Sat–Thu, 10:00 AM – 6:00 PM (BST)</p>
                    </ContactCard>

                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                        <div className="flex items-start gap-3">
                            <HelpCircle size={20} className="text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">Need quick answers?</p>
                                <p className="text-xs text-slate-500 mt-1">Check our FAQ for order, delivery, and return info.</p>
                                <Link href="/shop/faq" className="inline-block mt-2 text-sm font-semibold text-primary hover:underline">
                                    View FAQ →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="border-b border-slate-100 px-5 sm:px-7 py-5 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send a message</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Fill in the form and we&apos;ll get back to you soon.</p>
                        </div>
                        <form onSubmit={submit} className="p-5 sm:p-7 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="Full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    placeholder="Your name"
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="Phone (optional)"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                    placeholder="01XXXXXXXXX"
                                />
                                <Input
                                    label="Subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    error={errors.subject}
                                    placeholder="How can we help?"
                                    required
                                />
                            </div>
                            <Textarea
                                label="Message"
                                rows={6}
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                error={errors.message}
                                placeholder="Tell us more about your question..."
                                required
                            />
                            <Button type="submit" loading={processing} size="lg" className="w-full sm:w-auto">
                                <Send size={16} />
                                Send message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
