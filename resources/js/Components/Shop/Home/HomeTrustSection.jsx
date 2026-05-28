import { Truck, Banknote, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import ShopSection from '../ShopSection';

const items = [
    { icon: Truck, title: 'Nationwide delivery', desc: 'Fast shipping across Bangladesh' },
    { icon: Banknote, title: 'Cash on delivery', desc: 'Pay when you receive' },
    { icon: RotateCcw, title: 'Easy return', desc: '7-day hassle-free returns' },
    { icon: ShieldCheck, title: 'Secure payment', desc: '100% protected checkout' },
    { icon: Headphones, title: '24/7 support', desc: 'We are here to help' },
];

export default function HomeTrustSection() {
    return (
        <ShopSection title="Why shop with us" subtitle="Trusted shopping experience built for you">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {items.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="home-trust-card">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                            <Icon size={24} />
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </ShopSection>
    );
}
