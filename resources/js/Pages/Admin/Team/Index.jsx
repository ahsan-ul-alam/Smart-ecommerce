import { useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Users, Shield, Plus, Pencil, Trash2, Search, UserPlus, KeyRound, X,
} from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import Badge from '../../../Components/UI/Badge';
import FlashMessage from '../../../Components/UI/FlashMessage';
import Pagination from '../../../Components/UI/Pagination';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const groupPermissions = (permissions) => {
    const groups = {};
    permissions.forEach((name) => {
        const [prefix] = name.split('.');
        const key = prefix || 'other';
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(name);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
};

const roleName = (role) => (typeof role === 'string' ? role : role?.name);

const userHasRole = (user, name) => (user.roles ?? []).some((r) => roleName(r) === name);

export default function TeamIndex({
    staff,
    teamCount = 0,
    roles,
    permissions,
    roleOptions,
    filters,
    canManagePeople,
    canManageRoles,
    isSuperAdmin,
}) {
    const { auth } = usePage().props;
    const [tab, setTab] = useState(filters.tab || 'people');
    const [showInvite, setShowInvite] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [activeRoleId, setActiveRoleId] = useState(
        () => roles.find((r) => !r.is_locked)?.id ?? roles[0]?.id
    );

    const selectedRole = roles.find((r) => r.id === activeRoleId) ?? roles[0];

    const inviteForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: roleOptions[0]?.value || 'staff',
    });
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
        status: 'active',
    });
    const createRoleForm = useForm({ name: '' });
    const permissionsForm = useForm({ permissions: selectedRole?.permissions ?? [] });

    useEffect(() => {
        setTab(filters.tab || 'people');
    }, [filters.tab]);

    useEffect(() => {
        if (selectedRole) {
            permissionsForm.setData('permissions', selectedRole.permissions);
        }
    }, [selectedRole?.id]);

    const navigate = (params) => {
        router.get('/admin/team', {
            tab,
            role: filters.role || undefined,
            search: filters.search || undefined,
            ...params,
        }, { preserveState: true, preserveScroll: true });
    };

    const switchTab = (nextTab) => {
        setTab(nextTab);
        navigate({ tab: nextTab, role: nextTab === 'roles' ? undefined : filters.role });
    };

    const filterByRole = (role) => {
        setTab('people');
        router.get('/admin/team', {
            tab: 'people',
            role: role || undefined,
            search: filters.search || undefined,
        });
    };

    const applySearch = (e) => {
        e.preventDefault();
        navigate({ tab: 'people', search: search || undefined });
    };

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

    const togglePermission = (name) => {
        if (selectedRole?.is_locked) {
            return;
        }
        const set = new Set(permissionsForm.data.permissions);
        if (set.has(name)) {
            set.delete(name);
        } else {
            set.add(name);
        }
        permissionsForm.setData('permissions', [...set].sort());
    };

    const deleteRole = (role) => {
        if (!confirm(`Delete role "${role.label}"?`)) {
            return;
        }
        router.delete(`/admin/roles/${role.id}`);
    };

    return (
        <AdminLayout title="Team">
            <FlashMessage />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Team & access</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Invite people, assign roles, and control what each role can do.
                    </p>
                </div>
                <div className="flex gap-2 text-sm text-slate-500">
                    <span>{teamCount} member{teamCount !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{roles.length} role{roles.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mb-6">
                {canManagePeople && (
                    <button
                        type="button"
                        onClick={() => switchTab('people')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            tab === 'people'
                                ? 'bg-white dark:bg-slate-700 text-teal-700 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                        }`}
                    >
                        <Users size={16} /> People
                    </button>
                )}
                {canManageRoles && (
                    <button
                        type="button"
                        onClick={() => switchTab('roles')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            tab === 'roles'
                                ? 'bg-white dark:bg-slate-700 text-teal-700 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                        }`}
                    >
                        <Shield size={16} /> Roles & permissions
                    </button>
                )}
            </div>

            {tab === 'people' && canManagePeople && (
                <>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                        <form onSubmit={applySearch} className="flex-1 flex gap-2 max-w-md">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="search"
                                    placeholder="Search name or email…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                />
                            </div>
                            <Button type="submit" variant="secondary">Search</Button>
                        </form>
                        <Button onClick={() => setShowInvite(true)}>
                            <UserPlus size={16} /> Invite member
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => filterByRole('')}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                !filters.role
                                    ? 'bg-teal-700 text-white border-teal-700'
                                    : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            All
                        </button>
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => filterByRole(role.name)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                    filters.role === role.name
                                        ? 'bg-teal-700 text-white border-teal-700'
                                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                {role.label}
                                <span className="ml-1 opacity-80">({role.users_count})</span>
                            </button>
                        ))}
                    </div>

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
                                    {staff?.data?.length ? (
                                        staff.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="px-6 py-3 font-medium">{user.name}</td>
                                                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                                                <td className="px-6 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => filterByRole(roleName(user.roles?.[0]))}
                                                        className="capitalize text-teal-700 hover:underline"
                                                    >
                                                        {roleName(user.roles?.[0])?.replace(/_/g, ' ') || '—'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                                                        {user.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(user)}
                                                        className="p-2 text-slate-400 hover:text-teal-700"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    {!userHasRole(user, 'super_admin') && user.id !== auth?.user?.id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => confirm('Remove this team member?') && router.delete(`/admin/staff/${user.id}`)}
                                                            className="p-2 text-red-500 hover:text-red-700"
                                                            title="Remove"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                {filters.role || filters.search
                                                    ? 'No members match your filters.'
                                                    : 'No team members yet. Invite someone to get started.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>

                    {staff?.links && <Pagination links={staff.links} meta={staff.meta} />}
                </>
            )}

            {tab === 'roles' && canManageRoles && (
                <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-4">
                        {isSuperAdmin && (
                            <Card>
                                <CardHeader title="New role" />
                                <CardBody>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            createRoleForm.post('/admin/roles', {
                                                onSuccess: () => createRoleForm.reset(),
                                            });
                                        }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            placeholder="e.g. warehouse_manager"
                                            value={createRoleForm.data.name}
                                            onChange={(e) => createRoleForm.setData('name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                            error={createRoleForm.errors.name}

                                        />
                                        <Button type="submit" loading={createRoleForm.processing}>
                                            <Plus size={16} />
                                        </Button>
                                    </form>
                                    <p className="text-xs text-slate-500 mt-2">Lowercase with underscores.</p>
                                </CardBody>
                            </Card>
                        )}

                        <Card>
                            <CardBody className="p-0 divide-y divide-slate-200 dark:divide-slate-700">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className={`flex items-center justify-between gap-2 px-4 py-3 transition-colors ${
                                            activeRoleId === role.id
                                                ? 'bg-teal-50 dark:bg-teal-900/20'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActiveRoleId(role.id)}
                                            className="font-medium text-left flex-1"
                                        >
                                            {role.label}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => filterByRole(role.name)}
                                            className="text-xs text-teal-700 hover:underline shrink-0"
                                        >
                                            {role.users_count} member{role.users_count !== 1 ? 's' : ''}
                                        </button>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>

                    <div className="lg:col-span-8">
                        {selectedRole && (
                            <Card>
                                <CardHeader
                                    title={selectedRole.label}
                                    subtitle={
                                        selectedRole.is_locked
                                            ? 'Full access to everything'
                                            : `${selectedRole.permissions.length} permissions · assign people from the People tab`
                                    }
                                    action={
                                        isSuperAdmin && !selectedRole.is_system ? (
                                            <Button variant="secondary" type="button" onClick={() => deleteRole(selectedRole)}>
                                                <Trash2 size={16} /> Delete
                                            </Button>
                                        ) : null
                                    }
                                />
                                <CardBody>
                                    {selectedRole.is_locked ? (
                                        <p className="text-sm text-slate-500">
                                            Super admins always have every permission. Assign members under{' '}
                                            <button type="button" onClick={() => switchTab('people')} className="text-teal-700 hover:underline">
                                                People
                                            </button>
                                            .
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-2">
                                                <KeyRound size={14} /> Permissions
                                            </p>
                                            <div className="space-y-6 max-h-[28rem] overflow-y-auto pr-2">
                                                {groupPermissions(permissions).map(([group, names]) => (
                                                    <div key={group}>
                                                        <p className="text-xs font-semibold uppercase text-slate-500 mb-2">{group}</p>
                                                        <div className="grid sm:grid-cols-2 gap-2">
                                                            {names.map((name) => (
                                                                <label
                                                                    key={name}
                                                                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={permissionsForm.data.permissions.includes(name)}
                                                                        onChange={() => togglePermission(name)}
                                                                        className="rounded"
                                                                    />
                                                                    <span className="font-mono text-xs">{name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 flex flex-wrap gap-2">
                                                <Button
                                                    loading={permissionsForm.processing}
                                                    onClick={() => permissionsForm.put(`/admin/roles/${selectedRole.id}`)}
                                                >
                                                    Save permissions
                                                </Button>
                                                {selectedRole.users_count > 0 && (
                                                    <Button
                                                        variant="secondary"
                                                        type="button"
                                                        onClick={() => filterByRole(selectedRole.name)}
                                                    >
                                                        View {selectedRole.users_count} member{selectedRole.users_count !== 1 ? 's' : ''}
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {showInvite && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader
                            title="Invite team member"
                            action={
                                <button type="button" onClick={() => setShowInvite(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            }
                        />
                        <CardBody>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    inviteForm.post('/admin/staff', {
                                        onSuccess: () => {
                                            inviteForm.reset();
                                            setShowInvite(false);
                                        },
                                    });
                                }}
                                className="space-y-4"
                            >
                                <Input label="Name" value={inviteForm.data.name} onChange={(e) => inviteForm.setData('name', e.target.value)} error={inviteForm.errors.name} />
                                <Input label="Email" type="email" value={inviteForm.data.email} onChange={(e) => inviteForm.setData('email', e.target.value)} error={inviteForm.errors.email} />
                                <Input label="Phone" value={inviteForm.data.phone} onChange={(e) => inviteForm.setData('phone', e.target.value)} />
                                <Input label="Password" type="password" value={inviteForm.data.password} onChange={(e) => inviteForm.setData('password', e.target.value)} error={inviteForm.errors.password} />
                                <Select label="Role" value={inviteForm.data.role} onChange={(e) => inviteForm.setData('role', e.target.value)} options={roleOptions} />
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" loading={inviteForm.processing}><UserPlus size={16} /> Send invite</Button>
                                    <Button type="button" variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader
                            title="Edit team member"
                            action={
                                <button type="button" onClick={() => setEditing(null)} className="p-1 text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            }
                        />
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
                                <Select label="Role" value={editForm.data.role} onChange={(e) => editForm.setData('role', e.target.value)} options={roleOptions} />
                                <Select
                                    label="Status"
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    options={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                        { value: 'banned', label: 'Banned' },
                                    ]}
                                />
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" loading={editForm.processing}>Save changes</Button>
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
