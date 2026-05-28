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
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function __construct(
        protected AuditLogService $audit,
    ) {}

    public function index(): Response
    {
        $staff = User::query()
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['super_admin', 'admin', 'staff']))
            ->with('roles:id,name')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'roles' => Role::query()->whereIn('name', ['super_admin', 'admin', 'staff'])->orderBy('name')->pluck('name'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', Rule::in(['admin', 'staff'])],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => UserStatus::Active,
        ]);

        $user->assignRole($data['role']);

        $this->audit->log('staff.created', $user, null, ['email' => $user->email, 'role' => $data['role']], $request);

        return back()->with('success', 'Staff member created.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->hasAnyRole(['super_admin', 'admin', 'staff']), 404);

        if ($user->hasRole('super_admin') && ! $request->user()->hasRole('super_admin')) {
            abort(403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(['super_admin', 'admin', 'staff'])],
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

        return back()->with('success', 'Staff member updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->hasAnyRole(['admin', 'staff']), 404);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $this->audit->log('staff.deleted', $user, ['email' => $user->email], null, $request);
        $user->delete();

        return back()->with('success', 'Staff member removed.');
    }
}
