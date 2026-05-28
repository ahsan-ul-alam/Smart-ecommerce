<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
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
    /** Roles that cannot be deleted. */
    protected const SYSTEM_ROLES = ['super_admin', 'admin', 'staff', 'customer'];

    public function __construct(
        protected AuditLogService $audit,
        protected ActivityLogService $activity,
    ) {}

    protected function authorizeRoleManagement(Request $request): void
    {
        abort_unless(
            $request->user()->hasRole('super_admin') || $request->user()->can('roles.manage'),
            403,
            'You do not have permission to manage roles.'
        );
    }

    protected function requireSuperAdmin(Request $request): void
    {
        abort_unless($request->user()->hasRole('super_admin'), 403, 'Only super admins can perform this action.');
    }

    public function index(Request $request): RedirectResponse
    {
        $this->authorizeRoleManagement($request);

        return redirect()->route('admin.team.index', ['tab' => 'roles', ...$request->query()]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeRoleManagement($request);
        $this->requireSuperAdmin($request);

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-z][a-z0-9_]*$/',
                Rule::notIn(self::SYSTEM_ROLES),
                Rule::unique('roles', 'name'),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($data['permissions'] ?? []);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->audit->log('roles.created', $role, null, ['name' => $role->name], $request);
        $this->activity->log("Created role {$role->name}", 'roles', $role, null, $request);

        return redirect()->route('admin.team.index', ['tab' => 'roles'])->with('success', "Role \"{$this->roleLabel($role->name)}\" created.");
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->authorizeRoleManagement($request);
        abort_if($role->name === 'customer', 404);

        if ($role->name === 'super_admin') {
            abort_unless($request->user()->hasRole('super_admin'), 403, 'Only super admins can edit the super_admin role.');

            return redirect()->route('admin.team.index', ['tab' => 'roles'])->with('info', 'The super_admin role always has all permissions.');
        }

        $data = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        $before = $role->permissions->pluck('name')->sort()->values()->all();
        $role->syncPermissions($data['permissions']);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $after = collect($data['permissions'])->sort()->values()->all();

        $this->audit->log('roles.updated', $role, ['permissions' => $before], ['permissions' => $after], $request);
        $this->activity->log("Updated permissions for role {$role->name}", 'roles', $role, [
            'added' => array_values(array_diff($after, $before)),
            'removed' => array_values(array_diff($before, $after)),
        ], $request);

        return back()->with('success', "Permissions updated for {$this->roleLabel($role->name)}.");
    }

    public function destroy(Request $request, Role $role): RedirectResponse
    {
        $this->authorizeRoleManagement($request);
        $this->requireSuperAdmin($request);
        abort_if(in_array($role->name, self::SYSTEM_ROLES, true), 403, 'System roles cannot be deleted.');

        $members = User::role($role->name)->count();
        if ($members > 0) {
            return redirect()->route('admin.team.index', ['tab' => 'roles'])->with('error', "Remove all {$members} member(s) from this role before deleting it.");
        }

        $name = $role->name;
        $this->audit->log('roles.deleted', $role, ['name' => $name], null, $request);
        $role->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()->route('admin.team.index', ['tab' => 'roles'])->with('success', "Role \"{$this->roleLabel($name)}\" deleted.");
    }

    public function syncMembers(Request $request, Role $role): RedirectResponse
    {
        $this->authorizeRoleManagement($request);
        abort_if($role->name === 'customer', 404);

        if ($role->name === 'super_admin') {
            $this->requireSuperAdmin($request);
        }

        $data = $request->validate([
            'user_ids' => ['present', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $userIds = collect($data['user_ids'])->unique()->values();

        foreach ($userIds as $userId) {
            $user = User::query()->find($userId);
            if (! $user) {
                continue;
            }
            if ($user->hasRole('customer') && $user->roles->count() === 1) {
                continue;
            }
            $user->syncRoles([$role->name]);
        }

        $toRemove = User::role($role->name)->whereNotIn('id', $userIds)->get();
        foreach ($toRemove as $user) {
            if ($role->name === 'super_admin') {
                if (User::role('super_admin')->count() <= 1) {
                    continue;
                }
                if ($user->id === $request->user()->id) {
                    continue;
                }
            }
            $user->syncRoles(['staff']);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->activity->log("Updated members for role {$role->name}", 'roles', $role, [
            'user_ids' => $userIds->all(),
        ], $request);

        return back()->with('success', "Members updated for {$this->roleLabel($role->name)}.");
    }

    protected function roleLabel(string $name): string
    {
        return str_replace('_', ' ', ucwords($name, '_'));
    }
}
