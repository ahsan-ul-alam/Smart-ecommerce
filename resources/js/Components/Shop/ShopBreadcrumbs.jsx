import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

export default function ShopBreadcrumbs({ items = [], className = '' }) {
    if (!items.length) return null;

    return (
        <nav aria-label="Breadcrumb" className={`mb-4 ${className}`.trim()}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                <li>
                    <Link href="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                        <Home size={14} />
                        <span className="sr-only sm:not-sr-only">Home</span>
                    </Link>
                </li>
                {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                        <ChevronRight size={14} className="text-slate-300 shrink-0" />
                        {item.href ? (
                            <Link href={item.href} className="hover:text-primary transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px] sm:max-w-none">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
