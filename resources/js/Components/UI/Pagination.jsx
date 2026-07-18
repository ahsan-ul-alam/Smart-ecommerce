import { Link } from '@inertiajs/react';
import clsx from 'clsx';

export default function Pagination({ links = [], meta, className }) {
    // The renderable page-number links are an array of {url, label, active}. For API-resource
    // collections that array lives at `meta.links`; a raw paginator passes it as `links` itself.
    // The {first, last, prev, next} object form is NOT usable here (Object.values yields nulls
    // that crash the map), so only accept real arrays.
    const pageLinks = Array.isArray(meta?.links)
        ? meta.links
        : Array.isArray(links)
            ? links
            : [];

    if (!meta || meta.last_page <= 1 || pageLinks.length === 0) return null;

    return (
        <div className={clsx('flex items-center justify-between mt-4 text-sm text-slate-500', className)}>
            <span>
                Showing {meta.from}–{meta.to} of {meta.total}
            </span>
            <div className="flex gap-1 flex-wrap">
                {pageLinks.map((link, i) => {
                    if (!link || i === 0 || i === pageLinks.length - 1) return null;
                    return (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveState
                            className={clsx(
                                'px-3 py-1 rounded-lg',
                                link.active
                                    ? 'bg-teal-700 text-white'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700',
                                !link.url && 'opacity-40 pointer-events-none'
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
