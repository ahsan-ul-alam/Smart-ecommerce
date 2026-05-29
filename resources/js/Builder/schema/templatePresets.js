import { createComponent } from '../registry/components';
import { mergeTheme, THEME_PRESETS } from './themeTokens';

function section(children, props = {}) {
    const sec = createComponent('section');
    sec.props = { fullWidth: true, paddingY: 'lg', ...props };
    const container = createComponent('container');
    container.children = children;
    sec.children = [container];
    return sec;
}

function node(type, props, styleDesktop = {}) {
    const n = createComponent(type);
    n.props = { ...n.props, ...props };
    if (Object.keys(styleDesktop).length) {
        n.style = { desktop: styleDesktop, tablet: {}, mobile: {} };
    }
    return n;
}

function schema(themeKey, roots) {
    const preset = THEME_PRESETS[themeKey];
    return {
        version: 2,
        theme: mergeTheme(preset || {}),
        roots,
    };
}

function inDays(days) {
    return new Date(Date.now() + days * 86400000).toISOString();
}

// ─── Kafela Mart style ───────────────────────────────────────────
// Green hero, trust stats row, product, reviews, FAQ, checkout (COD)

export function kafelaMartTemplate() {
    return schema('kafela_mart', [
        section([
            node('hero_banner', {
                title: 'অরিজিনাল প্রোডাক্ট — সারাদেশে ডেলিভারি',
                subtitle: 'আজই অর্ডার করুন · ক্যাশ অন ডেলিভারি · ২৪ ঘণ্টায় প্রসেসিং',
                button: 'এখনই অর্ডার করুন',
                buttonUrl: '#checkout',
                overlay: 'dark',
                badge: '🔥 সীমিত স্টক',
            }),
            node('stats', {
                items: [
                    { value: '২৪ ঘণ্টা', label: 'Fast delivery' },
                    { value: 'COD', label: 'Cash on delivery' },
                    { value: '100%', label: 'Authentic product' },
                    { value: '24/7', label: 'Support' },
                ],
            }),
            node('product', {}),
            node('features', {
                title: 'কেন এই পেজ থেকে অর্ডার করবেন?',
                items: [
                    '১০০% অরিজিনাল পণ্য',
                    'দ্রুত ডেলিভারি সারাদেশে',
                    'ক্যাশ অন ডেলিভারি সুবিধা',
                    'সহজ রিটার্ন পলিসি',
                ],
            }),
            node('testimonials', {
                title: 'ক্রেতাদের মতামত',
                items: [
                    { name: 'Karim Uddin', text: 'সময়মতো পণ্য পেয়েছি, একদম অরিজিনাল।', rating: 5 },
                    { name: 'Sadia Akter', text: 'COD তে অর্ডার করা সহজ ছিল, recommend করি।', rating: 5 },
                    { name: 'Rahim', text: 'দাম অন্য জায়গার চেয়ে ভালো পেয়েছি।', rating: 5 },
                ],
            }),
            node('faq', {
                title: 'সাধারণ জিজ্ঞাসা',
                items: [
                    { q: 'ডেলিভারি কত দিনে?', a: 'ঢাকায় ১–২ দিন, ঢাকার বাইরে ২–৫ কর্মদিবস।' },
                    { q: 'COD আছে?', a: 'হ্যাঁ, ক্যাশ অন ডেলিভারি সারাদেশে উপলব্ধ।' },
                    { q: 'রিটার্ন করা যাবে?', a: 'ত্রুটিপূর্ণ পণ্য ৭ দিনের মধ্যে রিটার্ন করা যাবে।' },
                ],
            }),
            node('cta', {
                title: 'আজই অর্ডার করুন',
                body: 'স্টক সীমিত — এই অফার শীঘ্রই শেষ হতে পারে',
                button: 'অর্ডার করুন',
            }),
            node('checkout', {
                title: 'অর্ডার ফর্ম',
                subtitle: 'নাম, ঠিকানা ও ফোন দিন — COD বা অনলাইন পেমেন্ট',
            }),
        ], { backgroundColor: '#ffffff' }),
    ]);
}

// ─── Ghorer Bazar style ──────────────────────────────────────────
// Warm orange, countdown, categories, product grid, trust, checkout

export function ghorerBazarTemplate() {
    return schema('ghorer_bazar', [
        section([
            node('hero_banner', {
                title: 'ঘরের বাজার — সেরা দামে দৈনন্দিন পণ্য',
                subtitle: 'তাজা · নির্ভরযোগ্য · দ্রুত ডেলিভারি · সারাদেশে COD',
                button: 'অফার দেখুন',
                buttonUrl: '#checkout',
                overlay: 'dark',
            }),
            node('countdown', {
                targetDate: inDays(2),
                label: '⚡ ফ্ল্যাশ সেল শেষ হচ্ছে',
            }, { margin: '0 0 1rem' }),
            node('stats', {
                items: [
                    { value: 'Free', label: 'Delivery ৳999+' },
                    { value: 'COD', label: 'Pay on delivery' },
                    { value: 'Fresh', label: 'Quality checked' },
                ],
            }),
            node('category_grid', { title: 'জনপ্রিয় ক্যাটাগরি', limit: 8 }),
            node('product_grid', {
                title: 'আজকের সেরা ডিল',
                dataSource: { type: 'featured', limit: 8 },
                columns: 4,
            }),
            node('product_carousel', {
                title: 'নতুন আগমন',
                dataSource: { type: 'new', limit: 10 },
            }),
            node('features', {
                title: 'ঘরের বাজারে কেন কিনবেন?',
                items: ['সেরা দাম', 'গুণগত মান', 'দ্রুত ডেলিভারি', 'সহজ রিটার্ন'],
            }),
            node('faq', {
                title: 'FAQ',
                items: [
                    { q: 'মিনিমাম অর্ডার?', a: 'কোনো মিনিমাম নেই — যেকোনো পরিমাণ অর্ডার করুন।' },
                    { q: 'ডেলিভারি চার্জ?', a: '৳৯৯৯+ অর্ডারে ফ্রি ডেলিভারি (নির্বাচিত এলাকা)।' },
                ],
            }),
            node('checkout', { title: 'অর্ডার করুন', subtitle: 'ঠিকানা দিন — COD উপলব্ধ' }),
        ]),
    ]);
}

// ─── Wajih Premium style ─────────────────────────────────────────
// Dark luxury, gold accents, single product focus, minimal elegant

export function wajihPremiumTemplate() {
    const darkBg = { backgroundColor: '#0f172a', color: '#faf8f5', padding: '2.5rem 1rem', borderRadius: '1rem' };
    const goldAccent = { color: '#d4af37' };

    return schema('wajih_premium', [
        section([
            node('heading', { text: 'PREMIUM COLLECTION', level: 1, align: 'center' }, { ...goldAccent, textAlign: 'center', fontSize: '0.875rem', letterSpacing: '0.2em', fontWeight: '600' }),
            node('hero_banner', {
                title: 'Luxury You Deserve',
                subtitle: 'Handpicked premium quality · Exclusive offer · Limited edition',
                button: 'Order Now',
                buttonUrl: '#checkout',
                overlay: 'dark',
            }, { margin: '1rem 0' }),
            node('product', {}, { padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }),
            node('text', {
                title: 'Crafted for excellence',
                body: 'Premium materials, elegant design, and unmatched quality. Each piece reflects sophistication and lasting value.',
            }, { textAlign: 'center', padding: '1rem 0' }),
            node('stats', {
                items: [
                    { value: 'Premium', label: 'Grade A quality' },
                    { value: '1 Year', label: 'Warranty' },
                    { value: 'VIP', label: 'Support' },
                ],
            }),
            node('testimonials', {
                title: 'What clients say',
                items: [
                    { name: 'Ahmed R.', text: 'Exceptional quality — exactly as described. Worth every taka.', rating: 5 },
                    { name: 'Nadia H.', text: 'Premium packaging and fast delivery. Highly satisfied.', rating: 5 },
                ],
            }),
            node('cta', {
                title: 'Exclusive offer ends soon',
                body: 'Join thousands of satisfied premium customers',
                button: 'Secure your order',
            }, darkBg),
            node('checkout', {
                title: 'Complete your order',
                subtitle: 'Secure checkout · Cash on delivery available',
            }),
        ], { backgroundColor: '#faf8f5' }),
    ]);
}

// ─── Additional useful templates ─────────────────────────────────

export function flashSaleTemplate() {
    return schema('flash_red', [
        section([
            node('countdown', { targetDate: inDays(1), label: '🔥 FLASH SALE ENDS IN' }),
            node('hero_banner', {
                title: 'মেগা ফ্ল্যাশ সেল — ৫০% পর্যন্ত ছাড়',
                subtitle: 'আজ রাত ১২টা পর্যন্ত · সীমিত স্টক',
                button: 'এখনই কিনুন',
                buttonUrl: '#checkout',
            }),
            node('product_grid', { dataSource: { type: 'flash_sale', limit: 8 }, columns: 4 }),
            node('checkout', { title: 'অর্ডার', subtitle: 'COD · bKash · Nagad' }),
        ]),
    ]);
}

export function eidCampaignTemplate() {
    return schema('ghorer_bazar', [
        section([
            node('hero_banner', {
                title: '🌙 ঈদ স্পেশাল কালেকশন',
                subtitle: 'পোশাক · গিফট · হোম ডেকো — বিশেষ ছাড়',
                button: 'ঈদ অফার দেখুন',
                buttonUrl: '#checkout',
            }),
            node('category_grid', { limit: 8 }),
            node('product_grid', { title: 'ঈদ বেস্ট সেলার', dataSource: { type: 'featured', limit: 8 }, columns: 4 }),
            node('features', { title: 'ঈদ অফারে পাবেন', items: ['Gift wrapping', 'Express delivery', 'COD', 'Easy exchange'] }),
            node('checkout', { title: 'ঈদ অর্ডার', subtitle: 'আগে অর্ডার করুন — সময়মতো পৌঁছে দেব' }),
        ]),
    ]);
}

export function singleProductOfferTemplate() {
    return schema('kafela_mart', [
        section([
            node('hero_banner', {
                title: 'Special Offer — Limited Time',
                subtitle: 'Original product · Nationwide delivery · Cash on delivery',
                button: 'Order Now',
                buttonUrl: '#checkout',
            }),
            node('product', {}),
            node('stats', {
                items: [
                    { value: '✓', label: '100% Original' },
                    { value: 'COD', label: 'Cash on delivery' },
                    { value: '2-5d', label: 'Delivery' },
                ],
            }),
            node('faq', {
                title: 'FAQ',
                items: [
                    { q: 'Is this original?', a: 'Yes, 100% authentic with warranty where applicable.' },
                    { q: 'Payment options?', a: 'Cash on delivery, bKash, Nagad, and card payment.' },
                ],
            }),
            node('checkout', { title: 'Place order', subtitle: 'Fill details below' }),
        ]),
    ]);
}

export function leadGenTemplate() {
    return schema('teal_modern', [
        section([
            node('hero_banner', { title: 'Get exclusive deals', subtitle: 'Subscribe for early access', button: 'Subscribe', buttonUrl: '#checkout' }),
            node('newsletter', { title: 'Join our list', placeholder: 'Your email or phone' }),
            node('cta', { title: 'Ready?', body: 'Limited spots available', button: 'Get started' }),
        ]),
    ]);
}

export function blankTemplate() {
    return { version: 2, theme: mergeTheme(), roots: [] };
}
