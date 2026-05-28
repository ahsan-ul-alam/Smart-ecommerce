<?php

namespace Database\Seeders;

use App\Domain\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::query()->updateOrCreate(
            ['email' => 'admin@arcommerze.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => UserStatus::Active,
                'locale' => 'en',
            ]
        );

        $superAdmin->assignRole('super_admin');
    }
}
