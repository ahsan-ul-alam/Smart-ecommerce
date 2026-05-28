import clsx from 'clsx';

export default function ProductCarousel({ children, className, columns = 4 }) {
    return (
        <div className={clsx('relative -mx-1 px-1', className)}>
            <div className={clsx('product-carousel-track', columns === 5 && 'cols-5')}>
                {children}
            </div>
        </div>
    );
}

export function ProductCarouselItem({ children, className }) {
    return <div className={clsx('product-carousel-item', className)}>{children}</div>;
}
