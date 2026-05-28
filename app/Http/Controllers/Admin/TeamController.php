<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TeamController extends Controller
{
    protected const SYSTEM_ROLES = ['super_admin', 'admin', 'staff', 'customer'];

    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()->hasRole('super_admin')
            || $request->user()->can('users.manage')
            || $request->user()->can('roles.manage'),
            403
        );

        $canManagePeople = $request->user()->hasRole('super_admin') || $request->user()->can('users.manage');
        $canManageRoles = $request->user()->hasRole('super_admin') || $request->user()->can('roles.manage');
        $isSuperAdmin = $request->user()->hasRole('super_admin');

        $roleOrder = ['super_admin' => 0, 'admin' => 1, 'staff' => 2];

        $roles = Role::query()
            ->with('permissions:id,name')
            ->where('name', '!=', 'customer')
            ->get()
            ->sortBy(fn (Role $role) => $roleOrder[$role->name] ?? 99)
            ->values()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $this->roleLabel($role->name),
                'permissions' => $role->permissions->pluck('name')->values()->all(),
                'users_count' => User::role($role->name)->count(),
                'is_system' => in_array($role->name, self::SYSTEM_ROLES, true),
                'is_locked' => $role->name === 'super_admin',
            ]);

        $roleOptions = $roles
            ->filter(fn (array $role) => $isSuperAdmin || $role['name'] !== 'super_admin')
            ->map(fn (array $role) => [
                'value' => $role['name'],
                'label' => $role['label'],
            ])
            ->values()
            ->all();

        $staff = null;
        if ($canManagePeople) {
            $staffQuery = User::query()
                ->whereHas('roles', fn ($q) => $q->where('name', '!=', 'customer'))
                ->with('roles:id,name');

            if ($request->filled('role')) {
                $staffQuery->role($request->string('role'));
            }

            if ($request->filled('search')) {
                $search = '%'.$request->string('search').'%';
                $staffQuery->where(fn ($q) => $q
                    ->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search));
            }

            $staff = $staffQuery
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'roles' => $user->roles->pluck('name')->values()->all(),
                    'status' => $user->status?->value ?? $user->status,
                ]);
        }

        $permissions = Permission::query()
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();

        $tab = $request->string('tab', 'people');
        if ($tab === 'people' && ! $canManagePeople && $canManageRoles) {
            $tab = 'roles';
        }

        $teamCount = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', '!=', 'customer'))
            ->count();

        return Inertia::render('Admin/Team/Index', [
            'staff' => $staff,
            'teamCount' => $teamCount,
            'roles' => $roles,
            'permissions' => $permissions,
            'roleOptions' => $roleOptions,
            'filters' => [
                'tab' => $tab,
                'role' => $request->string('role'),
                'search' => $request->string('search'),
            ],
            'canManagePeople' => $canManagePeople,
            'canManageRoles' => $canManageRoles,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    protected function roleLabel(string $name): string
    {
        return str_replace('_', ' ', ucwords($name, '_'));
    }
}
