<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const TABLES = [
        'users', 'employees', 'roles', 'role_user', 'occasions',
        'company_values', 'company_value_occasion', 'wallets',
        'recognitions', 'company_value_recognition', 'ledger_entries',
    ];

    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        foreach (self::TABLES as $table) {
            DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        }

        DB::statement('CREATE POLICY public_reference_occasions ON occasions FOR SELECT TO anon, authenticated USING (is_active = true)');
        DB::statement('CREATE POLICY public_reference_company_values ON company_values FOR SELECT TO anon, authenticated USING (is_active = true)');
        DB::statement('CREATE POLICY public_reference_value_occasions ON company_value_occasion FOR SELECT TO anon, authenticated USING (true)');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        foreach (self::TABLES as $table) {
            DB::statement("ALTER TABLE {$table} DISABLE ROW LEVEL SECURITY");
        }
    }
};
