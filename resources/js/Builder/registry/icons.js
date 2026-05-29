import {
    Type, AlignLeft, MousePointer, Image, Video, Minus, MoveVertical, Sparkles,
    Layout, Columns, Grid, ShoppingBag, Package, Star, HelpCircle, Megaphone,
    Timer, Mail, CreditCard, GalleryHorizontal, Layers, Box,
} from 'lucide-react';

export const COMPONENT_ICONS = {
    heading: Type,
    text: AlignLeft,
    paragraph: AlignLeft,
    button: MousePointer,
    image: Image,
    video: Video,
    divider: Minus,
    spacer: MoveVertical,
    icon: Sparkles,
    html: AlignLeft,
    section: Layout,
    container: Box,
    grid: Grid,
    columns: Columns,
    flex: Columns,
    product_grid: ShoppingBag,
    product_carousel: ShoppingBag,
    featured_products: Star,
    flash_sale_products: Timer,
    category_grid: Layers,
    category_slider: Layers,
    product: Package,
    checkout: CreditCard,
    hero_banner: Image,
    countdown: Timer,
    cta: Megaphone,
    newsletter: Mail,
    testimonials: Star,
    faq: HelpCircle,
    pricing_table: CreditCard,
    stats: Grid,
    features: Sparkles,
    tabs: Layers,
    accordion: Layers,
    gallery: GalleryHorizontal,
    slider: GalleryHorizontal,
    carousel: GalleryHorizontal,
};

export function getComponentIcon(type) {
    return COMPONENT_ICONS[type] || Box;
}
