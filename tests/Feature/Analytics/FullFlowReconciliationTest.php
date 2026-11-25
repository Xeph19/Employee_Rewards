<?php

use App\Enums\RecognitionType;
use App\Enums\RoleName;
use App\Facades\Rewards;
use App\Models\Employee;
use App\Models\LedgerEntry;
use App\Models\Merchant;
use App\Models\Occasion;
use App\Models\Recognition;
use App\Models\Reward;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;

function setupFullFlowUsers(): array
{
    $adminRole = Role::query()->create(['name' => RoleName::Admin->value, 'label' => 'Administrator']);
    $managerRole = Role::query()->create(['name' => RoleName::Manager->value, 'label' => 'Manager']);
    $employeeRole = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);

    $admin = User::factory()->create(['name' => 'Admin Boss', 'email' => 'admin.test@example.com']);
    $admin->roles()->attach($adminRole);
    $adminWallet = Wallet::query()->create(['user_id' => $admin->id, 'balance' => 0]);
    Employee::query()->create(['user_id' => $admin->id, 'employee_number' => 'A-001', 'department' => 'Executive', 'job_title' => 'CEO']);

    $manager = User::factory()->create(['name' => 'Manager Lead', 'email' => 'manager.test@example.com']);
    $manager->roles()->attach($managerRole);
    $managerWallet = Wallet::query()->create(['user_id' => $manager->id, 'balance' => 0]);
    $managerEmp = Employee::query()->create(['user_id' => $manager->id, 'employee_number' => 'M-001', 'department' => 'Engineering', 'job_title' => 'Engineering Lead']);

    $employee = User::factory()->create(['name' => 'Staff Member', 'email' => 'employee.test@example.com']);
    $employee->roles()->attach($employeeRole);
    $employeeWallet = Wallet::query()->create(['user_id' => $employee->id, 'balance' => 0]);
    Employee::query()->create(['user_id' => $employee->id, 'employee_number' => 'E-001', 'department' => 'Engineering', 'job_title' => 'Software Engineer', 'manager_id' => $managerEmp->id]);

    $merchant = Merchant::query()->create(['name' => 'FullFlow Mart', 'slug' => 'fullflow-mart', 'category' => 'Dining']);
    $reward = Reward::query()->create(['merchant_id' => $merchant->id, 'name' => 'Coffee Voucher', 'slug' => 'coffee-voucher', 'points_cost' => 150, 'stock_quantity' => 10]);

    return compact('admin', 'adminWallet', 'manager', 'managerWallet', 'employee', 'employeeWallet', 'reward');
}

it('verifies ledger reconciliation: wallet balance equals sum of ledger entries', function () {
    ['manager' => $manager, 'employee' => $employee, 'employeeWallet' => $wallet] = setupFullFlowUsers();

    // 1. Award occasion
    $occasion = Occasion::query()->create(['name' => 'Welcome Onboard', 'default_points' => 300]);
    Rewards::award(
        recipient: $employee,
        awarder: $manager,
        type: RecognitionType::Occasion,
        message: 'Welcome to the team!',
        requestKey: 'ledger-recon-award-1',
        companyValueIds: [],
        occasionId: $occasion->id,
        points: 300,
    );

    $wallet->refresh();
    expect($wallet->balance)->toBe(300);
    $sum = (int) LedgerEntry::query()->where('wallet_id', $wallet->id)->sum('amount');
    expect($sum)->toBe($wallet->balance);

    // 2. Revoke recognition
    $recognition = Recognition::query()->where('recipient_id', $employee->id)->firstOrFail();
    Rewards::revoke($recognition, $manager, 'Test revocation');

    $wallet->refresh();
    expect($wallet->balance)->toBe(0);
    $sumAfterRevoke = (int) LedgerEntry::query()->where('wallet_id', $wallet->id)->sum('amount');
    expect($sumAfterRevoke)->toBe(0);
});

it('verifies full flow: recognition award -> ledger credit -> redemption -> ledger debit -> export', function () {
    ['manager' => $manager, 'employee' => $employee, 'employeeWallet' => $wallet, 'reward' => $reward] = setupFullFlowUsers();

    // Award 500 points
    Rewards::award(
        recipient: $employee,
        awarder: $manager,
        type: RecognitionType::AdHoc,
        message: 'Outstanding performance!',
        requestKey: 'full-flow-award',
        companyValueIds: [],
        points: 500,
    );

    $wallet->refresh();
    expect($wallet->balance)->toBe(500);

    // Redeem 150 points for reward
    $redemptionResponse = test()->actingAs($employee)->postJson(route('api.redemptions.store'), [
        'reward_id' => $reward->id,
        'request_key' => 'full-flow-redeem',
    ])->assertCreated();

    expect($redemptionResponse->json('data.reference'))->toStartWith('RDM-');
    $wallet->refresh();
    expect($wallet->balance)->toBe(350);

    // Ledger balance consistency
    $ledgerSum = (int) LedgerEntry::query()->where('wallet_id', $wallet->id)->sum('amount');
    expect($ledgerSum)->toBe(350);

    // Personal export
    $exportResponse = test()->actingAs($employee)->get(route('api.analytics.personal-export'));
    $exportResponse->assertOk();
    $exportResponse->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

it('enforces RBAC on analytics endpoints', function () {
    ['admin' => $admin, 'employee' => $employee] = setupFullFlowUsers();

    // Employee cannot access admin analytics
    test()->actingAs($employee)->getJson(route('api.analytics.admin.summary'))->assertForbidden();
    test()->actingAs($employee)->get(route('api.analytics.admin.system-export'))->assertForbidden();

    // Admin can access admin analytics
    test()->actingAs($admin)->getJson(route('api.analytics.admin.summary'))->assertOk();
    test()->actingAs($admin)->get(route('api.analytics.admin.system-export'))->assertOk();

    // Both can access their own employee analytics
    test()->actingAs($employee)->getJson(route('api.analytics.employee'))->assertOk();
    test()->actingAs($admin)->getJson(route('api.analytics.employee'))->assertOk();
});
