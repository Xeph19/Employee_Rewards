<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_values', function (Blueprint $table) {
            $table->unsignedInteger('default_points')->nullable()->after('description');
        });

        DB::table('company_values')->where('name', 'Customer First')->update(['default_points' => 50]);
        DB::table('company_values')->where('name', 'One Team')->update(['default_points' => 75]);
        DB::table('company_values')->where('name', 'Own the Outcome')->update(['default_points' => 100]);
    }

    public function down(): void
    {
        Schema::table('company_values', function (Blueprint $table) {
            $table->dropColumn('default_points');
        });
    }
};
