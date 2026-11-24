<?php

use App\Enums\RoleName;
use App\Models\CompanyValue;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;

it('credits one hundred points exactly once for a repeated request key', function () {
    $managerRole = Role::query()->create(['name' => RoleName::Manager->value, 'label' => 'Manager']);
    $manager = User::factory()->create();
    $manager->roles()->attach($managerRole);
    $managerEmployee = Employee::query()->create(['user_id' => $manager->id, 'employee_number' => 'M-1', 'department' => 'Engineering', 'job_title' => 'Manager']);

    $employeeRole = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);
    $recipient = User::factory()->create();
    $recipient->roles()->attach($employeeRole);
    Employee::query()->create(['user_id' => $recipient->id, 'manager_id' => $managerEmployee->id, 'employee_number' => 'E-1', 'department' => 'Engineering', 'job_title' => 'Engineer']);
    Wallet::query()->create(['user_id' => $recipient->id]);
    $value = CompanyValue::query()->create(['name' => 'One Team', 'color' => '#0f766e']);
    $payload = ['recipient_id' => $recipient->id, 'type' => 'ad_hoc', 'message' => 'Thank you for helping the team deliver.', 'points' => 100, 'request_key' => 'award-request-100', 'company_value_ids' => [$value->id]];

    $this->actingAs($manager)->postJson(route('api.recognitions.store'), $payload)->assertCreated();
    $this->actingAs($manager)->postJson(route('api.recognitions.store'), $payload)->assertCreated();

    $this->assertDatabaseCount('recognitions', 1);
    $this->assertDatabaseCount('ledger_entries', 1);
    $this->assertDatabaseHas('wallets', ['user_id' => $recipient->id, 'balance' => 100]);
    $this->assertDatabaseHas('ledger_entries', ['amount' => 100, 'balance_after' => 100]);
});

it('prevents a manager from awarding someone outside their reporting line', function () {
    $managerRole = Role::query()->create(['name' => RoleName::Manager->value, 'label' => 'Manager']);
    $manager = User::factory()->create();
    $manager->roles()->attach($managerRole);
    Employee::query()->create(['user_id' => $manager->id, 'employee_number' => 'M-1', 'department' => 'Sales', 'job_title' => 'Manager']);
    $recipient = User::factory()->create();
    Employee::query()->create(['user_id' => $recipient->id, 'employee_number' => 'E-2', 'department' => 'Finance', 'job_title' => 'Analyst']);
    $value = CompanyValue::query()->create(['name' => 'Ownership', 'color' => '#7c3aed']);

    $response = $this->actingAs($manager)->postJson(route('api.recognitions.store'), ['recipient_id' => $recipient->id, 'type' => 'ad_hoc', 'message' => 'Great work.', 'points' => 100, 'request_key' => 'outside-team', 'company_value_ids' => [$value->id]]);

    $response->assertUnprocessable()->assertJsonValidationErrors(['recipient_id']);
    $this->assertDatabaseCount('recognitions', 0);
});
