import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AccountLayout from '../../../Layouts/AccountLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import BangladeshAddressFields from '../../../Components/Address/BangladeshAddressFields';
import { formatShippingAddress } from '../../../utils/formatShippingAddress';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const empty = {
    label: 'Home',
    name: '',
    phone: '',
    email: '',
    division: '',
    district: '',
    thana: '',
    local_address: '',
    postal_code: '',
    is_default: false,
};

export default function AddressesIndex({ addresses, divisions }) {
    const [editing, setEditing] = useState(null);
    const form = useForm(empty);

    const openCreate = () => {
        setEditing('new');
        form.reset();
        form.setData(empty);
    };

    const openEdit = (addr) => {
        setEditing(addr.id);
        form.setData({ ...addr, is_default: !!addr.is_default });
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            form.post('/account/addresses', { onSuccess: () => setEditing(null) });
        } else {
            form.put(`/account/addresses/${editing}`, { onSuccess: () => setEditing(null) });
        }
    };

    const destroy = (id) => {
        if (confirm('Delete this address?')) router.delete(`/account/addresses/${id}`);
    };

    return (
        <AccountLayout title="My Addresses">
            <FlashMessage />
            <div className="flex justify-end mb-4">
                <Button onClick={openCreate}><Plus size={16} /> Add Address</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {editing && (
                    <Card className="lg:col-span-2">
                        <CardHeader title={editing === 'new' ? 'New Address' : 'Edit Address'} />
                        <CardBody>
                            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Label" value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} />
                                <Input label="Full Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                                <Input label="Phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} required />
                                <Input label="Email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                                <div className="sm:col-span-2">
                                    <BangladeshAddressFields
                                        data={form.data}
                                        setData={form.setData}
                                        errors={form.errors}
                                        divisions={divisions}
                                    />
                                </div>
                                <Input label="Postal Code" value={form.data.postal_code} onChange={(e) => form.setData('postal_code', e.target.value)} />
                                <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.data.is_default} onChange={(e) => form.setData('is_default', e.target.checked)} className="rounded" />
                                    Default address
                                </label>
                                <div className="sm:col-span-2 flex gap-2">
                                    <Button type="submit" loading={form.processing}>Save</Button>
                                    <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {addresses.map((addr) => {
                    const { lines } = formatShippingAddress(addr);
                    return (
                        <Card key={addr.id}>
                            <CardBody>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{addr.label}</span>
                                            {addr.is_default && <Badge variant="success">Default</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-600">{addr.name} · {addr.phone}</p>
                                        {lines.map((line, i) => (
                                            <p key={i} className="text-sm text-slate-500 mt-0.5">{line}</p>
                                        ))}
                                    </div>
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => openEdit(addr)} className="p-2 hover:bg-slate-100 rounded-lg"><Pencil size={16} /></button>
                                        <button type="button" onClick={() => destroy(addr.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
                {!addresses.length && !editing && (
                    <p className="text-slate-400 col-span-2 text-center py-8">No saved addresses yet.</p>
                )}
            </div>
        </AccountLayout>
    );
}
