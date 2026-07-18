<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `credentials` is stored as a Laravel-encrypted string (see SafeEncryptedArray cast),
     * which is not valid JSON. A `json` column rejects it with SQLSTATE[22032] 3140, so it
     * must be a plain text column.
     */
    public function up(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            $table->text('credentials')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            $table->json('credentials')->nullable()->change();
        });
    }
};
