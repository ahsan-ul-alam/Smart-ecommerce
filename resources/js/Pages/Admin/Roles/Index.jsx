import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Shield } from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Badge from '../../../Components/UI/Badge';
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

function RoleEditor({ role, permissions, canEditSuperAdmin, onClose }) {
    const readOnly = role.name === 'super_admin' && !canEditSuperAdmin;
    const locked = role.name === 'super_admin';
    const form = useForm({
        permissions: locked ? permissions : role.permissions,
    });

    const toggle = (name) => {
        if (locked || readOnly) {
            return;
        }
        const set = new Set(form.data.permissions);
        if (set.has(name)) {
            set.delete(name);
        } else {
            set.add(name);
        }
        form.setData('permissions', [...set].sort());
    };

    return (
        <Card className="mb-6">
            <CardHeader
                title={
                    <span className="flex items-center gap-2">
                        <Shield size={18} />
                        {role.name.replace('_', ' ')}
                    </span>
                }
                subtitle={
                    locked
                        ? 'Super admin always has all permissions.'
                        : `${form.data.permissions.length} of ${permissions.length} permissions`
                }
            />
            <CardBody>
                {readOnly ? (
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        Only super admins can edit this role.
                    </p>
                ) : null}

                <div className="space-y-6">
                    {groupPermissions(permissions).map(([group, names]) => (
                        <div key={group}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{group}</p>
                            <div className="grid sm:grid-cols-2 gap-2">
                                {names.map((name) => (
                                    <label
                                        key={name}
                                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.data.permissions.includes(name)}
                                            disabled={locked || readOnly}
                                            onChange={() => toggle(name)}
                                            className="rounded"
                                        />
                                        <span className="font-mono text-xs">{name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {!readOnly && (
                    <div className="mt-6 flex gap-2">
                        <Button
                            loading={form.processing}
                            onClick={() => form.put(`/admin/roles/${role.id}`)}
                        >
                            Save {role.name} permissions
                        </Button>
                        {onClose && (
                            <Button variant="secondary" type="button" onClick={onClose}>
                                Close
                            </Button>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

export default function RolesIndex({ roles, permissions, canEditSuperAdmin }) {
    const [activeRole, setActiveRole] = useState(roles[0]?.id ?? null);
    const selected = roles.find((r) => r.id === activeRole) ?? roles[0];

    return (
        <AdminLayout title="Roles & Permissions">
            <FlashMessage />
            <p className="text-sm text-slate-500 mb-6">
                Control what each staff role can access. Customer role has no admin permissions.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        type="button"
                        onClick={() => setActiveRole(role.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            activeRole === role.id
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        {role.name.replace('_', ' ')}
                        <Badge variant="default" className="ml-2">
                            {role.permissions.length}
                        </Badge>
                    </button>
                ))}
            </div>

            {selected && (
                <RoleEditor
                    key={selected.id}
                    role={selected}
                    permissions={permissions}
                    canEditSuperAdmin={canEditSuperAdmin}
                />
            )}
        </AdminLayout>
    );
}
