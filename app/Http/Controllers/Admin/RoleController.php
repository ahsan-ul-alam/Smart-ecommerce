<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Audit\ActivityLogService;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    protected const EDITABLE_ROLES = ['super_admin', 'admin', 'staff'];

    public function __construct(
        protected AuditLogService $audit,
        protected ActivityLogService $activity,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('roles.manage'), 403);

        $roles = Role::query()
            ->whereIn('name', self::EDITABLE_ROLES)
            ->with('permissions:id,name')
            ->get()
            ->sortBy(fn (Role $role) => array_search($role->name, self::EDITABLE_ROLES, true))
            ->values()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ]);

        $permissions = Permission::query()
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'canEditSuperAdmin' => $request->user()->hasRole('super_admin'),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        abort_unless($request->user()->can('roles.manage'), 403);
        abort_unless(in_array($role->name, self::EDITABLE_ROLES, true), 404);

        if ($role->name === 'super_admin' && ! $request->user()->hasRole('super_admin')) {
            abort(403, 'Only super admins can edit the super_admin role.');
        }

        $data = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        if ($role->name === 'super_admin') {
            $data['permissions'] = Permission::query()->pluck('name')->all();
        }

        $before = $role->permissions->pluck('name')->sort()->values()->all();
        $role->syncPermissions($data['permissions']);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $after = collect($data['permissions'])->sort()->values()->all();

        $this->audit->log('roles.updated', $role, ['permissions' => $before], ['permissions' => $after], $request);
        $this->activity->log("Updated permissions for role {$role->name}", 'roles', $role, [
            'added' => array_values(array_diff($after, $before)),
            'removed' => array_values(array_diff($before, $after)),
        ], $request);

        return back()->with('success', "Permissions updated for {$role->name}.");
    }
}
