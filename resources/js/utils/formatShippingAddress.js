/**
 * Format order/address for display (supports new BD hierarchy + legacy fields).
 */
export function formatShippingAddress(addr) {
    if (!addr) return { lines: [], single: '' };

    if (addr.division) {
        const lines = [
            addr.local_address || addr.address_line_1,
            [addr.thana || addr.city, addr.district, addr.division].filter(Boolean).join(', '),
        ].filter(Boolean);

        return { lines, single: lines.join('\n') };
    }

    const lines = [
        addr.address_line_1,
        addr.address_line_2,
        [addr.city, addr.district].filter(Boolean).join(', '),
    ].filter(Boolean);

    return { lines, single: lines.join('\n') };
}
