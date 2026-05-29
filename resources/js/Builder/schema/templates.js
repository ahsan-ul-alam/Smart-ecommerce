import { mergeTheme } from './themeTokens';
import {
    blankTemplate,
    kafelaMartTemplate,
    ghorerBazarTemplate,
    wajihPremiumTemplate,
    flashSaleTemplate,
    eidCampaignTemplate,
    singleProductOfferTemplate,
    leadGenTemplate,
} from './templatePresets';
import { createDefaultSchema } from './defaults';

export const PAGE_TEMPLATES = [
    {
        id: 'kafela_mart',
        label: 'Kafela Mart',
        description: 'Green trust · stats · reviews · COD checkout',
        category: 'bd_brands',
        preview: { primary: '#16a34a', secondary: '#f97316' },
        build: kafelaMartTemplate,
    },
    {
        id: 'ghorer_bazar',
        label: 'Ghorer Bazar',
        description: 'Warm orange · flash countdown · categories',
        category: 'bd_brands',
        preview: { primary: '#ea580c', secondary: '#fbbf24' },
        build: ghorerBazarTemplate,
    },
    {
        id: 'wajih_premium',
        label: 'Wajih Premium',
        description: 'Dark luxury · gold · single product focus',
        category: 'bd_brands',
        preview: { primary: '#0f172a', secondary: '#d4af37' },
        build: wajihPremiumTemplate,
    },
    {
        id: 'single_product',
        label: 'Single product offer',
        description: 'One product · trust badges · FAQ · order form',
        category: 'offers',
        preview: { primary: '#16a34a', secondary: '#f97316' },
        build: singleProductOfferTemplate,
    },
    {
        id: 'flash_sale',
        label: 'Flash sale',
        description: 'Countdown · urgency red · product grid',
        category: 'offers',
        preview: { primary: '#dc2626', secondary: '#fbbf24' },
        build: flashSaleTemplate,
    },
    {
        id: 'eid_campaign',
        label: 'Eid campaign',
        description: 'Festive hero · categories · best sellers',
        category: 'seasonal',
        preview: { primary: '#ea580c', secondary: '#fbbf24' },
        build: eidCampaignTemplate,
    },
    {
        id: 'lead_gen',
        label: 'Lead generation',
        description: 'Newsletter · CTA · minimal',
        category: 'marketing',
        preview: { primary: '#0d9488', secondary: '#f59e0b' },
        build: leadGenTemplate,
    },
    {
        id: 'product_launch',
        label: 'Product launch',
        description: 'Default launch layout',
        category: 'offers',
        preview: { primary: '#16a34a', secondary: '#f97316' },
        build: () => createDefaultSchema(mergeTheme({ primary_color: '#16a34a', secondary_color: '#f97316' })),
    },
    {
        id: 'blank',
        label: 'Blank page',
        description: 'Start from scratch',
        category: 'basic',
        preview: { primary: '#64748b', secondary: '#94a3b8' },
        build: blankTemplate,
    },
];

export const TEMPLATE_CATEGORIES = [
    { id: 'bd_brands', label: 'BD brand styles' },
    { id: 'offers', label: 'Product offers' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'basic', label: 'Basic' },
];

export function importTemplate(templateId) {
    const tpl = PAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return createDefaultSchema(mergeTheme());
    return tpl.build();
}

export { kafelaMartTemplate, ghorerBazarTemplate, wajihPremiumTemplate };
