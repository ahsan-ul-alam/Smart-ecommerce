export function buildCheckoutPreview(page, product, checkoutPreview = {}) {
    const price = Number(product?.price ?? 0);
    const shipping = 120;

    return {
        slug: page?.slug ?? 'preview',
        product,
        preview: true,
        divisions: checkoutPreview.divisions ?? [],
        paymentMethods: checkoutPreview.paymentMethods?.length
            ? checkoutPreview.paymentMethods
            : [
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'bkash', label: 'bKash' },
                { value: 'nagad', label: 'Nagad' },
                { value: 'sslcommerz', label: 'Online Payment' },
            ],
        initialTotals: {
            subtotal: price,
            discount: 0,
            shipping,
            tax: 0,
            total: price + shipping,
            unit_price: price,
            quantity: 1,
        },
    };
}
