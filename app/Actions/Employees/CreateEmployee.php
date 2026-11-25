<?php

namespace App\Actions\Employees;

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateEmployee
{
    /** @param array{name:string,email:string,password:string,employee_number:string,department:string,job_title:string,manager_id?:int|null,role:string,joined_at?:string|null,birth_date?:string|null} $data */
    public function handle(array $data): Employee
    {
        return DB::transaction(function () use ($data): Employee {
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            $role = Role::query()->where('name', $data['role'])->firstOrFail();
            $user->roles()->sync([$role->id]);
            $user->wallet()->create(['balance' => 0]);

            $employee = Employee::query()->create([
                'user_id' => $user->id,
                'employee_number' => $data['employee_number'],
                'department' => $data['department'],
                'job_title' => $data['job_title'],
                'manager_id' => $data['manager_id'] ?? null,
                'joined_at' => $data['joined_at'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
            ]);

            return $employee->load(['user.roles', 'manager.user']);
        });
    }
}
