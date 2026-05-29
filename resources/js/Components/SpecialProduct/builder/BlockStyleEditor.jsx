import Select from '../../UI/Select';

export default function BlockStyleEditor({ style = {}, onChange }) {
    const set = (key, value) => onChange({ ...style, [key]: value });

    return (
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold uppercase text-slate-500">Block style</p>
            <Select
                label="Alignment"
                value={style.align || 'left'}
                onChange={(e) => set('align', e.target.value)}
                options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                ]}
            />
            <Select
                label="Width"
                value={style.width || 'full'}
                onChange={(e) => set('width', e.target.value)}
                options={[
                    { value: 'full', label: 'Full width' },
                    { value: 'wide', label: 'Wide' },
                    { value: 'narrow', label: 'Narrow' },
                ]}
            />
            <Select
                label="Vertical spacing"
                value={style.paddingY || 'normal'}
                onChange={(e) => set('paddingY', e.target.value)}
                options={[
                    { value: 'none', label: 'None' },
                    { value: 'sm', label: 'Small' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'lg', label: 'Large' },
                ]}
            />
            <label className="block text-sm">
                <span className="text-slate-600 dark:text-slate-400">Background</span>
                <input type="color" value={style.background || '#ffffff'} onChange={(e) => set('background', e.target.value === '#ffffff' ? '' : e.target.value)} className="mt-1 h-9 w-full rounded cursor-pointer" />
            </label>
        </div>
    );
}
