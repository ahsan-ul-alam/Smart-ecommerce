export const formatPrice = (n) => `৳${Number(n ?? 0).toLocaleString('en-BD')}`;

export const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-BD', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
};

export const formatDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-BD', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

export const statusVariant = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    packed: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger',
    returned: 'default',
    refunded: 'default',
};

export const paymentVariant = {
    paid: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'default',
};

export const statusColors = {
    pending: 'text-amber-600 bg-amber-500/10',
    confirmed: 'text-sky-600 bg-sky-500/10',
    processing: 'text-indigo-600 bg-indigo-500/10',
    packed: 'text-violet-600 bg-violet-500/10',
    shipped: 'text-blue-600 bg-blue-500/10',
    delivered: 'text-emerald-600 bg-emerald-500/10',
    cancelled: 'text-red-600 bg-red-500/10',
    returned: 'text-amber-700 bg-amber-500/10',
    refunded: 'text-slate-600 bg-slate-500/10',
};

export const activityIcons = {
    pending: 'Clock',
    confirmed: 'CheckCircle2',
    processing: 'Cog',
    packed: 'Package',
    shipped: 'Truck',
    delivered: 'CheckCheck',
    cancelled: 'XCircle',
    returned: 'RotateCcw',
    refunded: 'Banknote',
};

export const courierColors = {
    pathao: 'bg-red-500',
    redx: 'bg-rose-600',
    steadfast: 'bg-emerald-600',
    paperfly: 'bg-sky-600',
    ecourier: 'bg-violet-600',
};

export const initials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
};
