<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recognitions', function (Blueprint $table) {
            $table->index(['revoked_at', 'created_at']);
        });

        Schema::table('occasions', function (Blueprint $table) {
            $table->index(['is_active', 'name']);
        });

        Schema::table('company_values', function (Blueprint $table) {
            $table->index(['is_active', 'name']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->index(['is_active', 'department']);
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'department']);
        });

        Schema::table('company_values', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'name']);
        });

        Schema::table('occasions', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'name']);
        });

        Schema::table('recognitions', function (Blueprint $table) {
            $table->dropIndex(['revoked_at', 'created_at']);
        });
    }
};
