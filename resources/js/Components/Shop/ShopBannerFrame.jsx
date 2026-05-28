import clsx from 'clsx';

/**
 * Fixed aspect-ratio banner slot. Images use object-fit: cover (crop to fill, no distortion).
 * variant: hero (21:9) | campaign (2:1) | flash (3:1)
 */
export default function ShopBannerFrame({
    src,
    alt = '',
    variant = 'hero',
    className,
    children,
    eager = false,
}) {
    return (
        <div className={clsx('shop-banner-frame', `shop-banner-frame--${variant}`, className)}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="shop-banner-frame__img"
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                />
            ) : (
                <div className="shop-banner-frame__placeholder shop-hero-gradient" aria-hidden />
            )}
            {children}
        </div>
    );
}
