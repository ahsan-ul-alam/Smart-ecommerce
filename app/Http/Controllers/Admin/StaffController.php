<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function __construct(
        protected AuditLogService $audit,
    ) {}

    public function index(Request $request): RedirectResponse
    {
        return redirect()->route('admin.team.index', $request->query());
    }

    protected function assignableRoleNames(Request $request): array
    {
        $names = Role::query()->where('name', '!=', 'customer')->orderBy('name')->pluck('name')->all();

        if (! $request->user()->hasRole('super_admin')) {
            $names = array_values(array_filter($names, fn (string $name) => $name !== 'super_admin'));
        }

        return $names;
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', Rule::in($this->assignableRoleNames($request))],
        ]);

        if ($data['role'] === 'super_admin' && ! $request->user()->hasRole('super_admin')) {
            abort(403, 'Only super admins can assign the super_admin role.');
        }

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => UserStatus::Active,
        ]);

        $user->assignRole($data['role']);

        $this->audit->log('staff.created', $user, null, ['email' => $user->email, 'role' => $data['role']], $request);

        return redirect()->route('admin.team.index', ['tab' => 'people'])->with('success', 'Team member invited.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->hasAnyRole(Role::query()->where('name', '!=', 'customer')->pluck('name')->all()), 404);

        if ($user->hasRole('super_admin') && ! $request->user()->hasRole('super_admin')) {
            abort(403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in($this->assignableRoleNames($request))],
            'status' => ['required', Rule::enum(UserStatus::class)],
            'password' => ['nullable', Password::defaults()],
        ]);

        if ($data['role'] === 'super_admin' && ! $request->user()->hasRole('super_admin')) {
            abort(403, 'Only super admins can assign the super_admin role.');
        }

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'status' => $data['status'],
            ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
        ]);

        $user->syncRoles([$data['role']]);

        $this->audit->log('staff.updated', $user, null, ['role' => $data['role'], 'status' => $data['status']], $request);

        return redirect()->route('admin.team.index', ['tab' => 'people'])->with('success', 'Team member updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->hasRole('super_admin'), 403, 'Super admin accounts cannot be deleted here.');
        abort_unless($user->hasAnyRole(Role::query()->where('name', '!=', 'customer')->pluck('name')->all()), 404);

        if ($user->id === $request->user()->id) {
            return redirect()->route('admin.team.index')->with('error', 'You cannot delete your own account.');
        }

        $this->audit->log('staff.deleted', $user, ['email' => $user->email], null, $request);
        $user->delete();

        return redirect()->route('admin.team.index', ['tab' => 'people'])->with('success', 'Team member removed.');
    }
}
