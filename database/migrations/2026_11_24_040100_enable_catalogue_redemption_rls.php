<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        foreach (['merchants', 'rewards', 'redemptions'] as $table) {
            DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        }

        DB::statement('CREATE POLICY active_merchants_read ON merchants FOR SELECT TO authenticated USING (is_active = true)');
        DB::statement('CREATE POLICY active_rewards_read ON rewards FOR SELECT TO authenticated USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()))');
        // No direct-client policy is created for redemptions. History is exposed
        // only through the authenticated Laravel API, which scopes rows by user.
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        foreach (['redemptions', 'rewards', 'merchants'] as $table) {
            DB::statement("ALTER TABLE {$table} DISABLE ROW LEVEL SECURITY");
        }
    }
};
