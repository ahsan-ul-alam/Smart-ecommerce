import { Link } from '@inertiajs/react';
import clsx from 'clsx';

export default function Pagination({ links = [], meta }) {
    const pageLinks = Array.isArray(links) ? links : Object.values(links ?? {});

    if (!meta || meta.last_page <= 1 || pageLinks.length === 0) return null;

    return (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
            <span>
                Showing {meta.from}–{meta.to} of {meta.total}
            </span>
            <div className="flex gap-1">
                {pageLinks.map((link, i) => {
                    if (i === 0 || i === pageLinks.length - 1) return null;
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
