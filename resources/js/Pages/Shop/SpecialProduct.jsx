import { Head } from '@inertiajs/react';
import OfferLayout from '../../Layouts/OfferLayout';
import PageRenderer from '../../Builder/engine/PageRenderer';
import LandingBlockRenderer from '../../Components/SpecialProduct/LandingBlockRenderer';
import OfferCheckoutForm from '../../Components/SpecialProduct/OfferCheckoutForm';

export default function SpecialProduct({ page, product, checkout, catalog = {} }) {
    const theme = { ...(page.theme ?? {}), ...(page.schema?.theme ?? {}) };
    const schema = page.schema ? { ...page.schema, theme } : null;
    const useSchema = schema?.roots?.length > 0;
    const blocks = page.blocks ?? [];
    const hasCheckoutBlock = blocks.some((b) => b.type === 'checkout');

    const checkoutProps = {
        slug: page.slug,
        product,
        divisions: checkout?.divisions ?? [],
        paymentMethods: checkout?.paymentMethods ?? [],
        initialTotals: checkout?.initialTotals ?? {},
    };

    const scrollToCheckout = () => document.getElementById('offer-checkout')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <OfferLayout page={page} theme={theme}>
            <Head title={page.seo_title || page.headline || page.name}>
                {page.seo_description && <meta name="description" content={page.seo_description} />}
                {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}
                {page.og_image && <meta property="og:image" content={page.og_image} />}
            </Head>

            {useSchema ? (
                <div id="offer-page">
                    <PageRenderer schema={schema} catalog={catalog} product={product} checkout={checkoutProps} />
                </div>
            ) : (
                <LegacyBlocks page={page} product={product} blocks={blocks} hasCheckoutBlock={hasCheckoutBlock} checkoutProps={checkoutProps} scrollToCheckout={scrollToCheckout} />
            )}
        </OfferLayout>
    );
}

function LegacyBlocks({ page, product, blocks, hasCheckoutBlock, checkoutProps, scrollToCheckout }) {
    return (
        <>
            {page.hero_image && (
                <img src={page.hero_image} alt="" className="w-full h-[min(360px,60vh)] object-cover" />
            )}
            <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
                {blocks.filter((b) => b.type !== 'checkout').map((block, i) => (
                    <LandingBlockRenderer key={i} block={block} product={product} onScrollToCheckout={scrollToCheckout} />
                ))}
                {hasCheckoutBlock ? (
                    blocks.filter((b) => b.type === 'checkout').map((block, i) => (
                        <LandingBlockRenderer key={i} block={block} product={product} checkoutProps={checkoutProps} />
                    ))
                ) : (
                    <section id="offer-checkout"><OfferCheckoutForm {...checkoutProps} /></section>
                )}
            </div>
        </>
    );
}
