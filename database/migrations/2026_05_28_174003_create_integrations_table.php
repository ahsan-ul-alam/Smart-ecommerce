<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // payment, courier, sms, email
            $table->string('provider');
            $table->string('label');
            $table->boolean('is_enabled')->default(false);
            $table->boolean('is_sandbox')->default(true);
            $table->unsignedInteger('priority')->default(0);
            $table->text('credentials')->nullable(); // encrypted blob (see SafeEncryptedArray cast), not JSON
            $table->json('config')->nullable();
            $table->json('webhook_config')->nullable();
            $table->timestamps();

            $table->unique(['type', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};
