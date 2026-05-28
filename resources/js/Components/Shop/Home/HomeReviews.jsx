import { Link } from '@inertiajs/react';
import { Star, BadgeCheck } from 'lucide-react';
import ShopSection from '../ShopSection';

export default function HomeReviews({ reviews = [] }) {
    if (!reviews.length) return null;

    return (
        <ShopSection title="Customer reviews" subtitle="What shoppers say about us">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide -mx-1 px-1">
                {reviews.map((review) => (
                    <article key={review.id} className="home-review-card">
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
        </ShopSection>
    );
}
