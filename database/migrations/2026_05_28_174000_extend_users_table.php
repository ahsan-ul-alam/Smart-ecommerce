<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->unique()->after('email');
            $table->string('avatar')->nullable()->after('phone');
            $table->string('locale', 5)->default('en')->after('avatar');
            $table->enum('status', ['active', 'inactive', 'banned'])->default('active')->after('locale');
            $table->string('provider')->nullable()->after('status');
            $table->string('provider_id')->nullable()->after('provider');
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
            $table->text('customer_notes')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 'avatar', 'locale', 'status',
                'provider', 'provider_id', 'phone_verified_at', 'customer_notes',
            ]);
        });
    }
};
