<?php

use App\Enums\RoleName;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;

it('allows an administrator to update and deactivate an employee', function () {
    $adminRole = Role::query()->create(['name' => RoleName::Admin->value, 'label' => 'Administrator']);
    $employeeRole = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);
    $admin = User::factory()->create();
    $admin->roles()->attach($adminRole);
    Employee::query()->create(['user_id' => $admin->id, 'employee_number' => 'A-1', 'department' => 'People', 'job_title' => 'Administrator']);
    $user = User::factory()->create();
    $user->roles()->attach($employeeRole);
    $employee = Employee::query()->create(['user_id' => $user->id, 'employee_number' => 'E-1', 'department' => 'Sales', 'job_title' => 'Associate']);

    $this->actingAs($admin)->patchJson(route('employees.update', $employee), [
        'name' => 'Updated Employee',
        'department' => 'Operations',
        'role' => RoleName::Employee->value,
    ])->assertOk()->assertJsonPath('data.user.name', 'Updated Employee');

    $this->actingAs($admin)->deleteJson(route('employees.destroy', $employee))->assertNoContent();

    $this->assertDatabaseHas('employees', ['id' => $employee->id, 'department' => 'Operations', 'is_active' => false]);
});
