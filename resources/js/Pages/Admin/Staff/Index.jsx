import { useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const roleName = (role) => (typeof role === 'string' ? role : role?.name);

const userHasRole = (user, name) =>
    (user.roles ?? []).some((r) => roleName(r) === name);

export default function StaffIndex({ staff, roles, canAssignSuperAdmin = false }) {
    const { auth } = usePage().props;

    const roleOptions = roles
        .filter((r) => canAssignSuperAdmin || r !== 'super_admin')
        .map((r) => ({ value: r, label: r.replace('_', ' ') }));
    const [editing, setEditing] = useState(null);
    const createForm = useForm({ name: '', email: '', phone: '', password: '', role: 'staff' });
    const editForm = useForm({ name: '', email: '', phone: '', password: '', role: 'staff', status: 'active' });

    const openEdit = (user) => {
        setEditing(user.id);
        editForm.setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '',
            role: roleName(user.roles?.[0]) || 'staff',
            status: typeof user.status === 'string' ? user.status : user.status?.value || 'active',
        });
    };

    return (
        <AdminLayout title="Staff">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-6">Manage admin and staff accounts. Customers are under Customers.</p>

            <Card className="mb-6">
                <CardHeader title="Add staff member" />
                <CardBody>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            createForm.post('/admin/staff', { onSuccess: () => createForm.reset() });
                        }}
                        className="grid sm:grid-cols-2 gap-4"
                    >
                        <Input label="Name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} error={createForm.errors.name} />
                        <Input label="Email" type="email" value={createForm.data.email} onChange={(e) => createForm.setData('email', e.target.value)} error={createForm.errors.email} />
                        <Input label="Phone" value={createForm.data.phone} onChange={(e) => createForm.setData('phone', e.target.value)} />
                        <Input label="Password" type="password" value={createForm.data.password} onChange={(e) => createForm.setData('password', e.target.value)} error={createForm.errors.password} />
                        <Select label="Role" value={createForm.data.role} onChange={(e) => createForm.setData('role', e.target.value)}
                            options={roleOptions} />
                        <div className="sm:col-span-2">
                            <Button type="submit" loading={createForm.processing}><Plus size={16} /> Create staff</Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            <Card>
                <CardBody className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-slate-500">
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {staff.data?.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-3 font-medium">{user.name}</td>
                                    <td className="px-6 py-3">{user.email}</td>
                                    <td className="px-6 py-3 capitalize">{roleName(user.roles?.[0]) || '—'}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                                            {typeof user.status === 'string' ? user.status : user.status?.value || user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button type="button" onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-teal-700"><Pencil size={16} /></button>
                                        {!userHasRole(user, 'super_admin') && user.id !== auth?.user?.id && (
                                            <button type="button" onClick={() => confirm('Delete?') && router.delete(`/admin/staff/${user.id}`)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Pagination links={staff.links} meta={staff.meta} />

            {editing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader title="Edit staff" />
                        <CardBody>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    editForm.put(`/admin/staff/${editing}`, { onSuccess: () => setEditing(null) });
                                }}
                                className="space-y-4"
                            >
                                <Input label="Name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                                <Input label="Email" type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} />
                                <Input label="Phone" value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)} />
                                <Input label="New password (optional)" type="password" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)} />
                                <Select label="Role" value={editForm.data.role} onChange={(e) => editForm.setData('role', e.target.value)}
                                    options={roleOptions} />
                                <Select label="Status" value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)}
                                    options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'banned', label: 'Banned' }]} />
                                <div className="flex gap-2">
                                    <Button type="submit" loading={editForm.processing}>Save</Button>
                                    <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
}
