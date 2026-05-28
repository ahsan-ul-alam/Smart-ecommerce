import { useForm, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Shield, Plus, Trash2, Users, KeyRound } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Badge from '../../../Components/UI/Badge';
import Input from '../../../Components/UI/Input';
import FlashMessage from '../../../Components/UI/FlashMessage';
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

export default function RolesIndex({ roles, permissions, assignableUsers, isSuperAdmin }) {
    const defaultRole = roles.find((r) => !r.is_locked) ?? roles[0];
    const [activeRoleId, setActiveRoleId] = useState(defaultRole?.id ?? null);
    const [tab, setTab] = useState('permissions');

    const selected = roles.find((r) => r.id === activeRoleId) ?? roles[0];

    const memberIdsForRole = useMemo(() => {
        if (!selected) {
            return [];
        }
        return assignableUsers
            .filter((u) => u.roles?.includes(selected.name))
            .map((u) => u.id);
    }, [assignableUsers, selected?.name]);

    const createForm = useForm({ name: '', permissions: [] });
    const permissionsForm = useForm({ permissions: selected?.permissions ?? [] });
    const membersForm = useForm({ user_ids: memberIdsForRole });

    useEffect(() => {
        if (selected) {
            permissionsForm.setData('permissions', selected.permissions);
            membersForm.setData('user_ids', memberIdsForRole);
        }
    }, [selected?.id]);

    const selectRole = (role) => {
        setActiveRoleId(role.id);
        permissionsForm.setData('permissions', role.permissions);
        setTab('permissions');
    };

    const togglePermission = (name) => {
        if (selected?.is_locked) {
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

    const toggleMember = (userId) => {
        const set = new Set(membersForm.data.user_ids);
        if (set.has(userId)) {
            set.delete(userId);
        } else {
            set.add(userId);
        }
        membersForm.setData('user_ids', [...set]);
    };

    const openMembersTab = () => {
        membersForm.setData('user_ids', memberIdsForRole);
        setTab('members');
    };

    const deleteRole = (role) => {
        if (!confirm(`Delete role "${role.label}"?`)) {
            return;
        }
        router.delete(`/admin/roles/${role.id}`);
    };

    return (
        <AdminLayout title="Roles & Permissions">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-6">
                Create roles, assign permissions, and assign staff to each role. Customer accounts are managed separately.
            </p>

            <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-4">
                    {isSuperAdmin && (
                        <Card>
                            <CardHeader title="Create role" />
                            <CardBody>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        createForm.post('/admin/roles', {
                                            onSuccess: () => createForm.reset(),
                                        });
                                    }}
                                    className="space-y-3"
                                >
                                    <Input
                                        label="Role key"
                                        placeholder="e.g. warehouse_manager"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                        error={createForm.errors.name}
                                    />
                                    <p className="text-xs text-slate-500">Lowercase letters, numbers, and underscores only.</p>
                                    <Button type="submit" loading={createForm.processing}>
                                        <Plus size={16} /> Create role
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>
                    )}

                    <Card>
                        <CardHeader title="Roles" />
                        <CardBody className="p-0 divide-y divide-slate-200 dark:divide-slate-700">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => selectRole(role)}
                                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors ${
                                        activeRoleId === role.id
                                            ? 'bg-teal-50 dark:bg-teal-900/20'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <Shield size={16} className="shrink-0 text-teal-700" />
                                        <span className="font-medium truncate">{role.label}</span>
                                    </span>
                                    <Badge variant="default">{role.users_count}</Badge>
                                </button>
                            ))}
                        </CardBody>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    {selected ? (
                        <Card>
                            <CardHeader
                                title={selected.label}
                                subtitle={
                                    selected.is_locked
                                        ? 'Has all permissions · assign members below'
                                        : `${selected.permissions.length} permissions · ${selected.users_count} member(s)`
                                }
                                action={
                                    isSuperAdmin && !selected.is_system ? (
                                        <Button variant="secondary" type="button" onClick={() => deleteRole(selected)}>
                                            <Trash2 size={16} /> Delete
                                        </Button>
                                    ) : null
                                }
                            />
                            <CardBody>
                                <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setTab('permissions')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 ${
                                            tab === 'permissions'
                                                ? 'border-teal-700 text-teal-700'
                                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        <KeyRound size={16} /> Permissions
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openMembersTab}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 ${
                                            tab === 'members'
                                                ? 'border-teal-700 text-teal-700'
                                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        <Users size={16} /> Members ({selected.users_count})
                                    </button>
                                </div>

                                {tab === 'permissions' && (
                                    <>
                                        {selected.is_locked && (
                                            <p className="text-sm text-slate-500 mb-4">
                                                The super admin role always has every permission.
                                            </p>
                                        )}
                                        <div className="space-y-6">
                                            {groupPermissions(permissions).map(([group, names]) => (
                                                <div key={group}>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                                                        {group}
                                                    </p>
                                                    <div className="grid sm:grid-cols-2 gap-2">
                                                        {names.map((name) => (
                                                            <label
                                                                key={name}
                                                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={permissionsForm.data.permissions.includes(name)}
                                                                    disabled={selected.is_locked}
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
                                        {!selected.is_locked && (
                                            <div className="mt-6">
                                                <Button
                                                    loading={permissionsForm.processing}
                                                    onClick={() => permissionsForm.put(`/admin/roles/${selected.id}`)}
                                                >
                                                    Save permissions
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {tab === 'members' && (
                                    <>
                                        <p className="text-sm text-slate-500 mb-4">
                                            Select users for this role. Unchecked users currently in this role will be moved to staff.
                                            {selected.name === 'super_admin' && !isSuperAdmin
                                                ? ' Only super admins can manage super admin members.'
                                                : null}
                                        </p>
                                        <div className="max-h-96 overflow-y-auto space-y-2 mb-6">
                                            {assignableUsers.length === 0 ? (
                                                <p className="text-sm text-slate-500">
                                                    No staff users yet.{' '}
                                                    <a href="/admin/staff" className="text-teal-700 hover:underline">
                                                        Add staff
                                                    </a>{' '}
                                                    first.
                                                </p>
                                            ) : (
                                                assignableUsers.map((user) => (
                                                    <label
                                                        key={user.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={membersForm.data.user_ids.includes(user.id)}
                                                            onChange={() => toggleMember(user.id)}
                                                            disabled={selected.name === 'super_admin' && !isSuperAdmin}
                                                            className="rounded"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium truncate">{user.name}</p>
                                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                        </div>
                                                        {user.roles?.[0] && user.roles[0] !== selected.name ? (
                                                            <Badge variant="default">{user.roles[0]}</Badge>
                                                        ) : null}
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                        <Button
                                            loading={membersForm.processing}
                                            disabled={selected.name === 'super_admin' && !isSuperAdmin}
                                            onClick={() => membersForm.put(`/admin/roles/${selected.id}/members`)}
                                        >
                                            Save members
                                        </Button>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    ) : (
                        <Card>
                            <CardBody>
                                <p className="text-slate-500">Create a role to get started.</p>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
