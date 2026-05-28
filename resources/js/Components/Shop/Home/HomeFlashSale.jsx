import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Zap, ArrowRight } from "lucide-react";
import ShopSection from "../ShopSection";
import ProductCarousel, { ProductCarouselItem } from "./ProductCarousel";
import ProductCard from "../ProductCard";

function useCountdown(endsAt) {
    const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        if (!endsAt) return undefined;
        const tick = () => {
            const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
            setLeft({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, [endsAt]);

    return left;
}

function Pad({ n }) {
    return (
        <span className="min-w-[2.25rem] px-2 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold text-sm tabular-nums">
            {String(n).padStart(2, "0")}
        </span>
    );
}

export default function HomeFlashSale({
    flashSale,
    products = [],
    wishlistProductIds = [],
}) {
    const left = useCountdown(flashSale?.ends_at);

    if (!flashSale || !products.length) return null;

    return (
        <ShopSection className="!py-8">
            <div className="home-flash-section space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-wide mb-1">
                            <Zap size={18} className="fill-current" /> Flash sale
                        </p>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            {flashSale.title}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Grab deals before time runs out
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Pad n={left.h} />
                            <span className="font-bold">:</span>
                            <Pad n={left.m} />
                            <span className="font-bold">:</span>
                            <Pad n={left.s} />
                        </div>
                        <Link
                            href={`/shop/flash-sales/${flashSale.slug}`}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90"
                        >
                            View all <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                <ProductCarousel>
                    {products.map((product) => (
                        <ProductCarouselItem key={product.id}>
                            <ProductCard
                                product={product}
                                catalog
                                compact
                                showQuickView={false}
                                wishlisted={wishlistProductIds.includes(
                                    product.id,
                                )}
                                className="ring-2 ring-secondary/30"
                            />
                        </ProductCarouselItem>
                    ))}
                </ProductCarousel>
            </div>
        </ShopSection>
    );
}
