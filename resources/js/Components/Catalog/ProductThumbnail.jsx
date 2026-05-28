export default function ProductThumbnail({ product, className = '', size = 'md' }) {
    const sizes = {
        sm: 'text-2xl',
        md: 'text-3xl',
        lg: 'text-8xl',
    };

    if (product?.image) {
        return (
            <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className={`object-cover w-full h-full ${className}`}
            />
        );
    }

    return (
        <div className={`flex items-center justify-center w-full h-full bg-slate-100 dark:bg-slate-700 text-slate-300 ${sizes[size]} ${className}`}>
            {product?.name?.charAt(0) ?? '?'}
        </div>
    );
}
