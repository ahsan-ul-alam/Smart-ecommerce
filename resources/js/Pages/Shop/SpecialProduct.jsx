import { Link, router } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import ProductThumbnail from '../../Components/Catalog/ProductThumbnail';
import ProductPrice from '../../Components/Catalog/ProductPrice';
import Button from '../../Components/UI/Button';

export default function SpecialProduct({ page, product }) {
    const addToCart = () => {
        router.post('/shop/cart', {
            product_id: product.id,
            quantity: 1,
            variant_id: product.variants?.[0]?.id ?? null,
        });
    };

    const blocks = page.blocks ?? [];

    return (
        <ShopLayout>
            <section className="rounded-3xl overflow-hidden mb-8 relative">
                {page.hero_image ? (
                    <img src={page.hero_image} alt={page.headline} className="w-full h-64 sm:h-80 object-cover" />
                ) : (
                    <div className="h-64 sm:h-80 bg-gradient-to-br from-indigo-600 to-violet-700" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center">
                    <div className="p-8 sm:p-12 text-white max-w-2xl">
                        <p className="text-sm uppercase tracking-widest text-white/80 mb-2">{page.name}</p>
                        <h1 className="text-3xl sm:text-5xl font-bold mb-3">{page.headline || product.name}</h1>
                        <p className="text-white/90 text-lg">{page.subheadline}</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <ProductThumbnail product={product} className="w-full h-full" size="lg" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h2>
                    <ProductPrice product={product} className="text-2xl font-bold text-primary mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{product.short_description}</p>
                    <div className="flex gap-3">
                        <Button onClick={addToCart}>Add to cart</Button>
                        <Link href={`/shop/products/${product.slug}`} className="px-5 py-2.5 rounded-xl border font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                            Full details
                        </Link>
                    </div>
                </div>
            </div>

            {blocks.map((block, i) => (
                <section key={i} className="mb-10 p-6 sm:p-8 rounded-2xl glass">
                    {block.type === 'text' && (
                        <>
                            {block.title && <h3 className="text-xl font-bold mb-3">{block.title}</h3>}
                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{block.body}</p>
                        </>
                    )}
                    {block.type === 'features' && (
                        <>
                            <h3 className="text-xl font-bold mb-4">{block.title || 'Features'}</h3>
                            <ul className="grid sm:grid-cols-2 gap-3">
                                {(block.items ?? []).map((item, j) => (
                                    <li key={j} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="text-primary font-bold">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {block.type === 'cta' && (
                        <div className="text-center py-6">
                            <h3 className="text-2xl font-bold mb-2">{block.title}</h3>
                            <p className="text-slate-500 mb-4">{block.body}</p>
                            <Button onClick={addToCart}>{block.button || 'Order now'}</Button>
                        </div>
                    )}
                </section>
            ))}
        </ShopLayout>
    );
}
