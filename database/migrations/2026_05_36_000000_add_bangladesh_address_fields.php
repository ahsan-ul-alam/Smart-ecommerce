<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('division')->nullable()->after('email');
            $table->string('thana')->nullable()->after('district');
            $table->text('local_address')->nullable()->after('thana');
        });
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn(['division', 'thana', 'local_address']);
        });
    }
};
