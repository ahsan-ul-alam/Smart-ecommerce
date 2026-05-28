import clsx from 'clsx';

export function Skeleton({ className }) {
    return <div className={clsx('skeleton', className)} aria-hidden />;
}

export function SkeletonCard() {
    return (
        <div className="surface-card overflow-hidden p-0">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    );
}
