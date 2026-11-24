<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\CompanyValue;
use App\Models\Occasion;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = collect([
            RoleName::Admin->value => 'Administrator',
            RoleName::Manager->value => 'Manager',
            RoleName::Employee->value => 'Employee',
        ])->map(fn (string $label, string $name) => Role::query()->firstOrCreate(['name' => $name], ['label' => $label]));

        $values = collect([
            ['name' => 'Customer First', 'color' => '#0f766e', 'description' => 'Create meaningful outcomes for customers.'],
            ['name' => 'One Team', 'color' => '#7c3aed', 'description' => 'Win through trust and collaboration.'],
            ['name' => 'Own the Outcome', 'color' => '#c2410c', 'description' => 'Act with initiative and accountability.'],
        ])->map(fn (array $value) => CompanyValue::query()->firstOrCreate(['name' => $value['name']], $value));

        collect([
            ['name' => 'Birthday', 'description' => 'Celebrate a teammate’s birthday.', 'default_points' => 100],
            ['name' => 'Work Anniversary', 'description' => 'Recognize commitment and contribution.', 'default_points' => 250],
            ['name' => 'Above & Beyond', 'description' => 'Celebrate exceptional impact.', 'default_points' => 500],
        ])->each(function (array $data) use ($values): void {
            $occasion = Occasion::query()->firstOrCreate(['name' => $data['name']], $data);
            $occasion->companyValues()->syncWithoutDetaching($values->pluck('id'));
        });

        $admin = $this->createUser('Admin User', 'admin@example.com', 'ADM-001', 'People', 'Rewards Administrator', $roles[RoleName::Admin->value]);
        $manager = $this->createUser('Manager User', 'manager@example.com', 'MGR-001', 'Engineering', 'Engineering Manager', $roles[RoleName::Manager->value]);
        $managerEmployeeId = $manager->employee?->id;
        $employee = $this->createUser('Employee User', 'employee@example.com', 'EMP-001', 'Engineering', 'Software Engineer', $roles[RoleName::Employee->value], $managerEmployeeId);

        $admin->wallet()->firstOrCreate([], ['balance' => 0]);
        $manager->wallet()->firstOrCreate([], ['balance' => 0]);
        $employee->wallet()->firstOrCreate([], ['balance' => 0]);
    }

    private function createUser(string $name, string $email, string $number, string $department, string $title, Role $role, ?int $managerId = null): User
    {
        $user = User::query()->firstOrCreate(['email' => $email], ['name' => $name, 'password' => 'password']);
        $user->roles()->sync([$role->id]);
        $user->employee()->firstOrCreate([], [
            'employee_number' => $number,
            'department' => $department,
            'job_title' => $title,
            'manager_id' => $managerId,
            'joined_at' => now()->subYear()->toDateString(),
        ]);

        return $user->load('employee');
    }
}
