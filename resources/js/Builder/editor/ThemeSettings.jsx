import Input from '../../Components/UI/Input';
import Select from '../../Components/UI/Select';
import { useBuilderStore } from '../store/builderStore';
import { THEME_PRESETS, mergeTheme } from '../schema/themeTokens';

export default function ThemeSettings() {
    const theme = useBuilderStore((s) => s.theme);
    const setTheme = useBuilderStore((s) => s.setTheme);

    const update = (patch) => setTheme(mergeTheme({ ...theme, ...patch }));

    const applyPreset = (presetId) => {
        const preset = THEME_PRESETS[presetId];
        if (preset) setTheme(mergeTheme(preset));
    };

    return (
        <div className="p-4 border-t space-y-3">
            <p className="text-xs font-bold uppercase text-slate-400">Page colors</p>
            <Select
                label="Color preset"
                value=""
                onChange={(e) => e.target.value && applyPreset(e.target.value)}
                options={[
                    { value: '', label: 'Choose preset…' },
                    ...Object.values(THEME_PRESETS).map((p) => ({ value: p.id, label: p.label })),
                ]}
            />
            <Input label="Primary" type="color" value={theme.primary_color || '#16a34a'} onChange={(e) => update({ primary_color: e.target.value })} />
            <Input label="Secondary / accent" type="color" value={theme.secondary_color || '#f97316'} onChange={(e) => update({ secondary_color: e.target.value })} />
            <Input label="Highlight" type="color" value={theme.accent_color || '#dc2626'} onChange={(e) => update({ accent_color: e.target.value })} />
            <Input label="Page background" type="color" value={theme.page_background || '#ffffff'} onChange={(e) => update({ page_background: e.target.value })} />
            <Select
                label="Background style"
                value={theme.background_style || 'plain'}
                onChange={(e) => update({ background_style: e.target.value })}
                options={[
                    { value: 'plain', label: 'Plain' },
                    { value: 'gradient', label: 'Gradient' },
                    { value: 'warm', label: 'Warm (Ghorer Bazar)' },
                    { value: 'premium', label: 'Premium cream' },
                ]}
            />
            <Select
                label="Content max width"
                value={theme.content_max_width || 'xl'}
                onChange={(e) => update({ content_max_width: e.target.value })}
                options={[
                    { value: 'sm', label: '640px' },
                    { value: 'md', label: '768px' },
                    { value: 'lg', label: '1024px' },
                    { value: 'xl', label: '1280px (default)' },
                    { value: 'full', label: 'Full width' },
                ]}
            />
        </div>
    );
}
