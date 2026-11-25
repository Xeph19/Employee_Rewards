<?php

use App\Enums\RoleName;
use App\Models\Employee;
use App\Models\LedgerEntry;
use App\Models\Occasion;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Artisan;

it('automatically awards birthday points on the matching date', function () {
    $adminRole = Role::query()->create(['name' => RoleName::Admin->value, 'label' => 'Administrator']);
    $empRole = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);

    $admin = User::factory()->create(['name' => 'Admin Boss']);
    $admin->roles()->attach($adminRole);
    Wallet::query()->create(['user_id' => $admin->id, 'balance' => 0]);

    $celebrant = User::factory()->create(['name' => 'Birthday Star']);
    $celebrant->roles()->attach($empRole);
    $wallet = Wallet::query()->create(['user_id' => $celebrant->id, 'balance' => 0]);
    Employee::query()->create([
        'user_id' => $celebrant->id,
        'employee_number' => 'B-001',
        'department' => 'Marketing',
        'job_title' => 'Specialist',
        'birth_date' => '1995-11-25',
        'joined_at' => '2020-01-15',
    ]);

    $birthdayOccasion = Occasion::query()->create([
        'name' => 'Birthday',
        'default_points' => 100,
    ]);

    Artisan::call('rewards:process-milestones', ['--date' => '2026-11-25']);

    $wallet->refresh();
    expect($wallet->balance)->toBe(100);
    expect(LedgerEntry::query()->where('wallet_id', $wallet->id)->count())->toBe(1);

    // Second run is idempotent (does not duplicate)
    Artisan::call('rewards:process-milestones', ['--date' => '2026-11-25']);
    $wallet->refresh();
    expect($wallet->balance)->toBe(100);
});

it('automatically awards anniversary points with year-scaling', function () {
    $adminRole = Role::query()->create(['name' => RoleName::Admin->value, 'label' => 'Administrator']);
    $empRole = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);

    $admin = User::factory()->create(['name' => 'Admin Boss']);
    $admin->roles()->attach($adminRole);
    Wallet::query()->create(['user_id' => $admin->id, 'balance' => 0]);

    $veteran = User::factory()->create(['name' => 'Veteran Star']);
    $veteran->roles()->attach($empRole);
    $wallet = Wallet::query()->create(['user_id' => $veteran->id, 'balance' => 0]);
    Employee::query()->create([
        'user_id' => $veteran->id,
        'employee_number' => 'V-001',
        'department' => 'Operations',
        'job_title' => 'Director',
        'joined_at' => '2023-11-25', // 3 years on 2026-11-25
    ]);

    $anniversaryOccasion = Occasion::query()->create([
        'name' => 'Work Anniversary',
        'default_points' => 200,
    ]);

    Artisan::call('rewards:process-milestones', ['--date' => '2026-11-25']);

    $wallet->refresh();
    // 3 years * 200 points = 600 points
    expect($wallet->balance)->toBe(600);
});
