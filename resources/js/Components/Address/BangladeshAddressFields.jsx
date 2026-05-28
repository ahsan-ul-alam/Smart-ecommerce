import { useEffect, useState } from 'react';
import axios from 'axios';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';

/**
 * Cascading Division → District → Thana (upazila) + local address.
 */
export default function BangladeshAddressFields({ data, setData, errors = {}, divisions = [] }) {
    const [districtOptions, setDistrictOptions] = useState([]);
    const [thanaOptions, setThanaOptions] = useState([]);

    useEffect(() => {
        if (!data.division) {
            setDistrictOptions([]);
            return;
        }

        axios
            .get('/shop/locations/districts', { params: { division: data.division } })
            .then((res) => setDistrictOptions(res.data.districts || []))
            .catch(() => setDistrictOptions([]));
    }, [data.division]);

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

    return (
        <div className="space-y-4">
            <Select
                label="Division"
                value={data.division || ''}
                onChange={onDivisionChange}
                options={divisions}
                placeholder="Select division"
                error={errors.division}
            />
            <Select
                label="District"
                value={data.district || ''}
                onChange={onDistrictChange}
                options={districtOptions}
                placeholder={data.division ? 'Select district' : 'Select division first'}
                error={errors.district}
                disabled={!data.division}
            />
            <Select
                label="Thana / Upazila"
                value={data.thana || ''}
                onChange={(e) => setData({ ...data, thana: e.target.value })}
                options={thanaOptions}
                placeholder={data.district ? 'Select thana' : 'Select district first'}
                error={errors.thana}
                disabled={!data.district}
            />
            <Textarea
                label="Local address"
                rows={3}
                value={data.local_address || ''}
                onChange={(e) => setData({ ...data, local_address: e.target.value })}
                error={errors.local_address}
                placeholder="House / road / area, landmark (e.g. House 12, Road 5, Block B)"
            />
        </div>
    );
}
