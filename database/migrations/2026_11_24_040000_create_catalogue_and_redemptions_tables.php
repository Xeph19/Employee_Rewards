<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category', 80);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['is_active', 'name']);
            $table->index(['category', 'is_active']);
        });

        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('points_cost');
            $table->unsignedInteger('stock_quantity')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'points_cost', 'id']);
            $table->index(['merchant_id', 'is_active']);
        });

        Schema::create('redemptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('wallet_id')->constrained()->restrictOnDelete();
            $table->foreignId('reward_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('points_spent');
            $table->string('status', 20)->default('completed');
            $table->string('reference', 40)->unique();
            $table->string('request_key', 100);
            $table->timestamps();
            $table->unique(['user_id', 'request_key']);
            $table->index(['user_id', 'created_at', 'id']);
        });

        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->foreignId('redemption_id')->nullable()->after('recognition_id')->constrained()->restrictOnDelete();
            $table->foreignId('recognition_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('redemption_id');
        });

        DB::table('ledger_entries')->whereNull('recognition_id')->delete();

        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->foreignId('recognition_id')->nullable(false)->change();
        });
        Schema::dropIfExists('redemptions');
        Schema::dropIfExists('rewards');
        Schema::dropIfExists('merchants');
    }
};
