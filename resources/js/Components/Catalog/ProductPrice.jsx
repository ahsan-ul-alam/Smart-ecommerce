import Badge from '../UI/Badge';

const formatPrice = (n) => `৳${Number(n).toLocaleString('en-BD')}`;

export default function ProductPrice({ product, size = 'md' }) {
    const priceClass = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-xl';

    return (
        <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`font-bold text-primary ${priceClass}`}>{formatPrice(product.price)}</span>
            {product.on_sale && product.original_price && (
                <>
                    <span className={`text-slate-400 line-through ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
                        {formatPrice(product.original_price)}
                    </span>
                    <Badge variant="warning">Flash Sale</Badge>
                </>
            )}
            {!product.on_sale && product.compare_price && product.compare_price > product.price && (
                <span className="text-slate-400 line-through text-sm">{formatPrice(product.compare_price)}</span>
            )}
        </div>
    );
}
