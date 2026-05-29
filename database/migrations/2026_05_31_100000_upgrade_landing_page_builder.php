<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('special_products', function (Blueprint $table) {
            $table->json('schema')->nullable()->after('blocks');
            $table->unsignedSmallInteger('schema_version')->default(2)->after('schema');
            $table->string('status')->default('draft')->after('is_published');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->timestamp('scheduled_at')->nullable()->after('published_at');
            $table->string('og_image')->nullable()->after('seo_description');
            $table->string('canonical_url')->nullable()->after('og_image');
        });

        Schema::create('landing_page_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('special_product_id')->constrained('special_products')->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->json('schema');
            $table->json('meta')->nullable();
            $table->string('type')->default('manual');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique(['special_product_id', 'version_number']);
            $table->index(['special_product_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_page_versions');

        Schema::table('special_products', function (Blueprint $table) {
            $table->dropColumn([
                'schema', 'schema_version', 'status', 'published_at',
                'scheduled_at', 'og_image', 'canonical_url',
            ]);
        });
    }
};
