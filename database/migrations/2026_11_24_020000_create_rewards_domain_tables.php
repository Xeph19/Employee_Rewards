<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->timestamps();
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'user_id']);
        });

        Schema::create('occasions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('default_points')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('company_values', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('color', 20)->default('#0f766e');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('company_value_occasion', function (Blueprint $table) {
            $table->foreignId('company_value_id')->constrained()->cascadeOnDelete();
            $table->foreignId('occasion_id')->constrained()->cascadeOnDelete();
            $table->primary(['company_value_id', 'occasion_id']);
        });

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->bigInteger('balance')->default(0);
            $table->unsignedBigInteger('version')->default(0);
            $table->timestamps();
        });

        Schema::create('recognitions', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('recipient_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('awarded_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('occasion_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 20);
            $table->text('message');
            $table->unsignedInteger('points');
            $table->decimal('sgd_amount', 12, 2)->nullable();
            $table->string('request_key', 100)->unique();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('revocation_reason')->nullable();
            $table->timestamps();

            $table->index(['recipient_id', 'created_at']);
            $table->index(['awarded_by', 'created_at']);
        });

        Schema::create('company_value_recognition', function (Blueprint $table) {
            $table->foreignId('company_value_id')->constrained()->restrictOnDelete();
            $table->foreignId('recognition_id')->constrained()->cascadeOnDelete();
            $table->primary(['company_value_id', 'recognition_id']);
        });

        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->restrictOnDelete();
            $table->foreignId('recognition_id')->constrained()->restrictOnDelete();
            $table->string('type', 20);
            $table->bigInteger('amount');
            $table->bigInteger('balance_after');
            $table->string('request_key', 120)->unique();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['wallet_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
        Schema::dropIfExists('company_value_recognition');
        Schema::dropIfExists('recognitions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('company_value_occasion');
        Schema::dropIfExists('company_values');
        Schema::dropIfExists('occasions');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
    }
};
