<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'settings.manage',
            'settings.integrations',
            'users.manage',
            'roles.manage',
            'products.manage',
            'categories.manage',
            'orders.manage',
            'customers.manage',
            'inventory.manage',
            'coupons.manage',
            'cms.manage',
            'reports.view',
            'notifications.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $superAdmin = Role::findOrCreate('super_admin');
        $admin = Role::findOrCreate('admin');
        $staff = Role::findOrCreate('staff');
        $customer = Role::findOrCreate('customer');

        $superAdmin->givePermissionTo(Permission::all());

        $admin->givePermissionTo([
            'dashboard.view', 'settings.manage', 'settings.integrations',
            'users.manage', 'products.manage', 'categories.manage',
            'orders.manage', 'customers.manage', 'inventory.manage',
            'coupons.manage', 'cms.manage', 'reports.view', 'notifications.manage',
        ]);

        $staff->givePermissionTo([
            'dashboard.view', 'products.manage', 'categories.manage',
            'orders.manage', 'customers.manage', 'inventory.manage',
        ]);

        $customer->givePermissionTo([]);
    }
}
