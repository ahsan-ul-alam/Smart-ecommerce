<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('refunded_amount', 12, 2)->default(0)->after('total');
        });

        Schema::table('order_return_requests', function (Blueprint $table) {
            $table->string('return_type', 20)->default('refund')->after('status');
            $table->decimal('partial_amount', 12, 2)->nullable()->after('return_type');
            $table->foreignId('exchange_product_id')->nullable()->after('partial_amount')->constrained('products')->nullOnDelete();
        });

        Schema::create('special_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('headline')->nullable();
            $table->string('subheadline')->nullable();
            $table->string('hero_image')->nullable();
            $table->json('blocks')->nullable();
            $table->json('theme')->nullable();
            $table->boolean('is_published')->default(false);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('phone_verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 20);
            $table->string('code', 10);
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['phone', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_verification_codes');
        Schema::dropIfExists('special_products');

        Schema::table('order_return_requests', function (Blueprint $table) {
            $table->dropForeign(['exchange_product_id']);
            $table->dropColumn(['return_type', 'partial_amount', 'exchange_product_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('refunded_amount');
        });
    }
};
