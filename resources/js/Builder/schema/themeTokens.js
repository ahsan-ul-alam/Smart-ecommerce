/** Shared landing-page theme tokens — keeps builder + storefront colors in sync */

export const DEFAULT_THEME = {
    primary_color: '#16a34a',
    secondary_color: '#f97316',
    accent_color: '#dc2626',
    page_background: '#ffffff',
    text_color: '#0f172a',
    background_style: 'plain',
};

/** Inspired by popular BD direct-response landing pages */
export const THEME_PRESETS = {
    kafela_mart: {
        id: 'kafela_mart',
        label: 'Kafela Mart style',
        description: 'Green trust + orange urgency · COD · 24h delivery',
        primary_color: '#16a34a',
        secondary_color: '#f97316',
        accent_color: '#dc2626',
        page_background: '#ffffff',
        text_color: '#1e293b',
        background_style: 'plain',
    },
    ghorer_bazar: {
        id: 'ghorer_bazar',
        label: 'Ghorer Bazar style',
        description: 'Warm orange · home & kitchen · flash deals',
        primary_color: '#ea580c',
        secondary_color: '#fbbf24',
        accent_color: '#c2410c',
        page_background: '#fffbf7',
        text_color: '#431407',
        background_style: 'warm',
    },
    wajih_premium: {
        id: 'wajih_premium',
        label: 'Wajih Premium style',
        description: 'Dark luxury · gold accents · premium product',
        primary_color: '#0f172a',
        secondary_color: '#d4af37',
        accent_color: '#b8860b',
        page_background: '#faf8f5',
        text_color: '#0f172a',
        background_style: 'premium',
    },
    flash_red: {
        id: 'flash_red',
        label: 'Flash sale (red)',
        description: 'High urgency red countdown offers',
        primary_color: '#dc2626',
        secondary_color: '#fbbf24',
        accent_color: '#991b1b',
        page_background: '#ffffff',
        text_color: '#1e293b',
        background_style: 'plain',
    },
    teal_modern: {
        id: 'teal_modern',
        label: 'Modern teal',
        description: 'Clean teal gradient storefront',
        primary_color: '#0d9488',
        secondary_color: '#f59e0b',
        accent_color: '#0f766e',
        page_background: '#ffffff',
        text_color: '#0f172a',
        background_style: 'gradient',
    },
};

export function mergeTheme(overrides = {}) {
    return { ...DEFAULT_THEME, ...overrides };
}

export function themeToCssVars(theme = {}) {
    const t = mergeTheme(theme);
    const primary = t.primary_color;
    const secondary = t.secondary_color;
    const accent = t.accent_color || secondary;

    return {
        '--offer-primary': primary,
        '--offer-secondary': secondary,
        '--offer-accent': accent,
        '--offer-bg': t.page_background || '#ffffff',
        '--offer-text': t.text_color || '#0f172a',
        '--offer-primary-dark': `color-mix(in srgb, ${primary} 75%, #000)`,
        '--offer-primary-light': `color-mix(in srgb, ${primary} 12%, #fff)`,
        '--offer-secondary-light': `color-mix(in srgb, ${secondary} 20%, #fff)`,
    };
}

export function pageBackgroundStyle(theme = {}) {
    const t = mergeTheme(theme);
    if (t.background_style === 'warm') {
        return `linear-gradient(180deg, color-mix(in srgb, ${t.primary_color} 6%, ${t.page_background}) 0%, ${t.page_background} 50%)`;
    }
    if (t.background_style === 'premium') {
        return t.page_background;
    }
    if (t.background_style === 'gradient') {
        return `linear-gradient(180deg, color-mix(in srgb, ${t.primary_color} 8%, white) 0%, ${t.page_background} 45%, color-mix(in srgb, ${t.secondary_color} 5%, white) 100%)`;
    }
    return t.page_background || '#ffffff';
}

export function builderSelectionClass() {
    return 'ring-2 ring-[var(--offer-primary)] ring-offset-2';
}
