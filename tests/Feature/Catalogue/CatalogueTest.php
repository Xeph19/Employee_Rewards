<?php

use App\Enums\RoleName;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\MerchantRewardSeeder;

it('seeds at least one hundred fictional merchants and rewards', function () {
    $this->seed(MerchantRewardSeeder::class);

    $this->assertDatabaseCount('merchants', 100);
    $this->assertDatabaseCount('rewards', 100);
});

it('searches and paginates available rewards', function () {
    $role = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);
    $user = User::factory()->create();
    $user->roles()->attach($role);
    Employee::query()->create(['user_id' => $user->id, 'employee_number' => 'E-100', 'department' => 'Engineering', 'job_title' => 'Engineer']);
    $this->seed(MerchantRewardSeeder::class);

    $response = $this->actingAs($user)->getJson(route('api.catalogue.index', ['search' => 'Ang Mo Kio', 'per_page' => 6]));

    $response->assertOk()
        ->assertJsonPath('meta.per_page', 6)
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('data.0.merchant.name', 'Ang Mo Kio Bites 001');
});

it('requires authentication to browse the catalogue', function () {
    $this->getJson(route('api.catalogue.index'))->assertUnauthorized();
});
