import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Star, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import ShopSection from '../ShopSection';

export default function HomeReviews({ reviews = [] }) {
    const trackRef = useRef(null);
    const [paused, setPaused] = useState(false);

    const isCarousel = reviews.length > 3;

    const scrollByPage = useCallback((dir) => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector('[data-review-card]');
        const step = card ? card.offsetWidth + 16 : el.clientWidth; // 16px = gap-4
        const maxLeft = el.scrollWidth - el.clientWidth;
        let next = el.scrollLeft + dir * step;

        if (dir > 0 && el.scrollLeft >= maxLeft - 8) {
            next = 0; // loop back to start
        } else if (dir < 0 && el.scrollLeft <= 8) {
            next = maxLeft; // loop to end
        }

        el.scrollTo({ left: next, behavior: 'smooth' });
    }, []);

    // Auto-advance while not hovered/focused.
    useEffect(() => {
        if (!isCarousel || paused) return undefined;
        const timer = setInterval(() => scrollByPage(1), 3800);
        return () => clearInterval(timer);
    }, [isCarousel, paused, scrollByPage]);

    if (!reviews.length) return null;

    return (
        <ShopSection title="Customer reviews" subtitle="What shoppers say about us">
            <div
                className="relative"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={() => setPaused(false)}
            >
                <div
                    ref={trackRef}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide -mx-1 px-1 scroll-smooth"
                >
                    {reviews.map((review) => (
                        <article key={review.id} data-review-card className="home-review-card snap-start">
                            <div className="flex items-center gap-3 mb-3">
                                {review.avatar ? (
                                    <img src={review.avatar} alt="" className="w-11 h-11 rounded-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                                        {review.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                                        {review.name}
                                        <BadgeCheck size={14} className="text-primary shrink-0" />
                                    </p>
                                    <div className="flex text-amber-500 mt-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={12} className={i < review.rating ? 'fill-current' : 'text-slate-200'} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed">{review.comment}</p>
                            {review.product_slug && (
                                <Link
                                    href={`/shop/products/${review.product_slug}`}
                                    className="text-xs text-primary font-medium mt-3 inline-block hover:underline"
                                >
                                    {review.product_name}
                                </Link>
                            )}
                        </article>
                    ))}
                </div>

                {isCarousel && (
                    <>
                        <button
                            type="button"
                            onClick={() => scrollByPage(-1)}
                            className={clsx(
                                'absolute left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-[2] p-2 rounded-full',
                                'bg-white/90 dark:bg-slate-800/90 shadow-md text-slate-700 dark:text-white',
                                'hover:bg-white dark:hover:bg-slate-700 transition-colors',
                            )}
                            aria-label="Previous reviews"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByPage(1)}
                            className={clsx(
                                'absolute right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-[2] p-2 rounded-full',
                                'bg-white/90 dark:bg-slate-800/90 shadow-md text-slate-700 dark:text-white',
                                'hover:bg-white dark:hover:bg-slate-700 transition-colors',
                            )}
                            aria-label="Next reviews"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>
        </ShopSection>
    );
}
