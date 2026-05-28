import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import clsx from 'clsx';
import ShopBannerFrame from '../ShopBannerFrame';

export default function HomeHeroSlider({ slides = [] }) {
    const [index, setIndex] = useState(0);
    const total = slides.length;

    useEffect(() => {
        if (total <= 1) return undefined;
        const t = setInterval(() => setIndex((i) => (i + 1) % total), 5500);
        return () => clearInterval(t);
    }, [total]);

    const slide = slides[index] ?? slides[0];

    if (!slide) return null;

    return (
        <section className="shop-container pt-4 sm:pt-6 pb-2">
            <div className="relative w-full">
                <ShopBannerFrame
                    src={slide.image}
                    alt={slide.title || ''}
                    variant="hero"
                    className="home-hero-slider home-hero-slider--full rounded-2xl w-full"
                    eager={index === 0}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-[1]" />
                    <div
                        className={clsx(
                            'absolute inset-x-0 bottom-0 z-[2] flex flex-col items-center justify-end text-center px-4 sm:px-8 pt-20 text-white pointer-events-none',
                            'pb-10 sm:pb-12',
                        )}
                    >
                        {slide.accent && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-slate-900 text-xs font-bold mb-3">
                                <Zap size={14} className="fill-current" /> Flash sale
                            </span>
                        )}
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance max-w-3xl">{slide.title}</h2>
                        {slide.subtitle && (
                            <p className="mt-2 text-sm sm:text-lg text-white/90 max-w-2xl">{slide.subtitle}</p>
                        )}
                        <Link
                            href={slide.link || '/shop/products'}
                            className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-white text-primary font-bold text-sm sm:text-base hover:bg-white/95 transition-premium shadow-lg pointer-events-auto"
                        >
                            Shop now
                        </Link>
                    </div>
                </ShopBannerFrame>

                {total > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => setIndex((i) => (i - 1 + total) % total)}
                            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-[3] p-2.5 rounded-full glass-dark text-slate-700 dark:text-white"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIndex((i) => (i + 1) % total)}
                            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-[3] p-2.5 rounded-full glass-dark text-slate-700 dark:text-white"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={22} />
                        </button>
                        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[4] flex gap-1.5">
                            {slides.map((s, i) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    className={clsx(
                                        'h-2 rounded-full transition-all',
                                        i === index ? 'w-6 bg-white' : 'w-2 bg-white/50',
                                    )}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

        </section>
    );
}
