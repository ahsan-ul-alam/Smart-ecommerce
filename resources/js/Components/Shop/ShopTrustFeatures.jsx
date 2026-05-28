import { Truck, Banknote, RotateCcw, ShieldCheck } from 'lucide-react';

const features = [
    { icon: Truck, title: 'Fast delivery', desc: 'Inside Dhaka 1–2 days' },
    { icon: Banknote, title: 'Cash on delivery', desc: 'Pay when you receive' },
    { icon: RotateCcw, title: 'Easy returns', desc: '7 days return policy' },
    { icon: ShieldCheck, title: 'Secure payment', desc: '100% secure payment' },
];

export default function ShopTrustFeatures({ className = '' }) {
    return (
        <section className={`shop-trust-features ${className}`}>
            <div className="shop-container">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="shop-trust-feature-card">
                            <div className="shop-trust-feature-icon">
                                <Icon size={22} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
