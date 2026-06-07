import { useEffect, useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';

/**
 * Cascading Division → District → Thana (upazila) + local address.
 */
const checkoutLabelClass = 'block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

export default function BangladeshAddressFields({
    data,
    setData,
    errors = {},
    divisions = [],
    layout = 'stack',
    disabled = false,
}) {
    const [districtOptions, setDistrictOptions] = useState([]);
    const [thanaOptions, setThanaOptions] = useState([]);
    const [allDistricts, setAllDistricts] = useState([]);

    useEffect(() => {
        if (layout !== 'checkout' || !divisions.length) return;

        Promise.all(
            divisions.map((division) =>
                axios
                    .get('/shop/locations/districts', { params: { division: division.value } })
                    .then((res) => (res.data.districts || []).map((district) => ({ ...district, division: division.value })))
                    .catch(() => []),
            ),
        ).then((results) => {
            setAllDistricts(
                results
                    .flat()
                    .sort((a, b) => a.label.localeCompare(b.label)),
            );
        });
    }, [layout, divisions]);

    useEffect(() => {
        if (layout === 'checkout') return;

        if (!data.division) {
            setDistrictOptions([]);
            return;
        }

        axios
            .get('/shop/locations/districts', { params: { division: data.division } })
            .then((res) => setDistrictOptions(res.data.districts || []))
            .catch(() => setDistrictOptions([]));
    }, [data.division, layout]);

    useEffect(() => {
        if (!data.division || !data.district) {
            setThanaOptions([]);
            return;
        }

        axios
            .get('/shop/locations/thanas', { params: { division: data.division, district: data.district } })
            .then((res) => setThanaOptions(res.data.thanas || []))
            .catch(() => setThanaOptions([]));
    }, [data.division, data.district]);

    const onDivisionChange = (e) => {
        setData({
            ...data,
            division: e.target.value,
            district: '',
            thana: '',
        });
    };

    const onDistrictChange = (e) => {
        setData({
            ...data,
            district: e.target.value,
            thana: '',
        });
    };

    const onCheckoutDistrictChange = (e) => {
        const district = e.target.value;
        const match = allDistricts.find((d) => d.value === district);

        setData({
            ...data,
            district,
            division: match?.division || '',
            thana: '',
        });
    };

    if (layout === 'checkout') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className={checkoutLabelClass}>District</label>
                        <select
                            className={clsx('input-premium', errors.district && 'border-red-400')}
                            value={data.district || ''}
                            onChange={onCheckoutDistrictChange}
                            disabled={disabled}
                            required
                        >
                            <option value="">Select district</option>
                            {allDistricts.map((opt) => (
                                <option key={`${opt.division}-${opt.value}`} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {errors.district && <p className="text-xs text-red-500">{errors.district}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className={checkoutLabelClass}>Area / Thana</label>
                        <select
                            className={clsx('input-premium', errors.thana && 'border-red-400')}
                            value={data.thana || ''}
                            onChange={(e) => setData({ ...data, thana: e.target.value })}
                            disabled={disabled || !data.district}
                            required
                        >
                            <option value="">{data.district ? 'Select area' : 'Select district first'}</option>
                            {thanaOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {errors.thana && <p className="text-xs text-red-500">{errors.thana}</p>}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className={checkoutLabelClass}>Street Address</label>
                    <input
                        className={clsx('input-premium', errors.local_address && 'border-red-400')}
                        value={data.local_address || ''}
                        onChange={(e) => setData({ ...data, local_address: e.target.value })}
                        placeholder="House / flat no, road, block, etc."
                        disabled={disabled}
                        required
                    />
                    {errors.local_address && <p className="text-xs text-red-500">{errors.local_address}</p>}
                </div>
                {errors.division && <p className="text-xs text-red-500">{errors.division}</p>}
            </div>
        );
    }

    const locationGrid = layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
                label="Division"
                value={data.division || ''}
                onChange={onDivisionChange}
                options={divisions}
                placeholder="Select division"
                error={errors.division}
                disabled={disabled}
                required
            />
            <Select
                label="District"
                value={data.district || ''}
                onChange={onDistrictChange}
                options={districtOptions}
                placeholder={data.division ? 'Select district' : 'Select division first'}
                error={errors.district}
                disabled={disabled || !data.division}
                required
            />
            <Select
                label="Upazila / Thana"
                value={data.thana || ''}
                onChange={(e) => setData({ ...data, thana: e.target.value })}
                options={thanaOptions}
                placeholder={data.district ? 'Select upazila' : 'Select district first'}
                error={errors.thana}
                disabled={disabled || !data.district}
                required
            />
        </div>
    ) : null;

    if (layout === 'grid') {
        return (
            <div className="space-y-4">
                {locationGrid}
                <Textarea
                    label="Full address"
                    rows={3}
                    value={data.local_address || ''}
                    onChange={(e) => setData({ ...data, local_address: e.target.value })}
                    error={errors.local_address}
                    placeholder="House / road / area, landmark"
                    disabled={disabled}
                    required
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Select
                label="Division"
                value={data.division || ''}
                onChange={onDivisionChange}
                options={divisions}
                placeholder="Select division"
                error={errors.division}
                disabled={disabled}
            />
            <Select
                label="District"
                value={data.district || ''}
                onChange={onDistrictChange}
                options={districtOptions}
                placeholder={data.division ? 'Select district' : 'Select division first'}
                error={errors.district}
                disabled={disabled || !data.division}
            />
            <Select
                label="Thana / Upazila"
                value={data.thana || ''}
                onChange={(e) => setData({ ...data, thana: e.target.value })}
                options={thanaOptions}
                placeholder={data.district ? 'Select thana' : 'Select district first'}
                error={errors.thana}
                disabled={disabled || !data.district}
            />
            <Textarea
                label="Local address"
                rows={3}
                value={data.local_address || ''}
                onChange={(e) => setData({ ...data, local_address: e.target.value })}
                error={errors.local_address}
                placeholder="House / road / area, landmark (e.g. House 12, Road 5, Block B)"
                disabled={disabled}
            />
        </div>
    );
}
