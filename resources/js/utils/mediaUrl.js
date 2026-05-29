export function mediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
        return path;
    }
    const normalized = path.replace(/\\/g, '/').replace(/^\//, '');
    if (normalized.startsWith('storage/')) {
        return `/${normalized}`;
    }
    return `/storage/${normalized}`;
}
