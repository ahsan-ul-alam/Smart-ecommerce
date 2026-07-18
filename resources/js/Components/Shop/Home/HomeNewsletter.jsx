import { useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import ShopSection from '../ShopSection';

export default function HomeNewsletter() {
    const form = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post('/newsletter/subscribe', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return (
        <ShopSection>
            <div className="home-newsletter">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                    <Mail size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-gray-600">Stay in the loop</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto text-sm sm:text-base">
                    Get exclusive deals, new arrivals, and flash sale alerts delivered to your inbox.
                </p>
                <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        className="input-premium flex-1 py-3"
                    />
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-60 btn-primary-glow shrink-0"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </ShopSection>
    );
}
