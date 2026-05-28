export const BANNER_SIZE_HINT = 'Recommended: 1200 × 400 px (3:1). Any size is cropped to fit the banner area.';

export default function BannerImageField({
    label = 'Banner image',
    required = false,
    preview,
    previewVariant = 'hero',
    inputRef,
    onChange,
    onRemove,
    error,
    showRemove = false,
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {preview && (
                <div className={`shop-banner-frame shop-banner-frame--${previewVariant} mb-3 max-w-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600`}>
                    <img src={preview} alt="Preview" className="shop-banner-frame__img" />
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={onChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-800 dark:file:bg-teal-900/40 dark:file:text-teal-200"
            />
            <p className="text-xs text-slate-500 mt-1">{BANNER_SIZE_HINT}</p>
            <p className="text-xs text-slate-400">JPEG, PNG, or WebP · max 5 MB</p>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            {showRemove && preview && (
                <button type="button" onClick={onRemove} className="text-xs text-red-600 mt-2 hover:underline">
                    Remove image
                </button>
            )}
        </div>
    );
}
