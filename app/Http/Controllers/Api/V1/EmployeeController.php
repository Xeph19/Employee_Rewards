<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Employees\CreateEmployee;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->user()->can('viewAny', Employee::class) || abort(403);

        $employees = Cache::remember('employees:list:v1', 60, function () {
            return Employee::query()
                ->select([
                    'id',
                    'user_id',
                    'manager_id',
                    'employee_number',
                    'department',
                    'job_title',
                    'joined_at',
                    'is_active',
                ])
                ->with(['user:id,name,email', 'user.roles:id,name', 'manager.user:id,name'])
                ->orderBy('employee_number')
                ->get();
        });

        return response()->json([
            'data' => $employees,
        ]);
    }

    public function store(StoreEmployeeRequest $request, CreateEmployee $createEmployee): JsonResponse
    {
        $employee = $createEmployee->handle($request->validated());
        Cache::forget('employees:list:v1');

        return response()->json(['data' => $employee], 201);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $employee = DB::transaction(function () use ($request, $employee): Employee {
            $data = $request->validated();
            $user = User::query()->where('id', $employee->user_id)->firstOrFail();
            $user->update(collect($data)->only(['name', 'email'])->all());

            if (isset($data['role'])) {
                $roleId = Role::query()->where('name', $data['role'])->value('id');
                $user->roles()->sync([$roleId]);
            }

            $employee->update(collect($data)->except(['name', 'email', 'role'])->all());

            return $employee->load(['user.roles', 'manager.user']);
        });

        Cache::forget('employees:list:v1');

        return response()->json(['data' => $employee]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        Gate::authorize('delete', $employee);
        $employee->update(['is_active' => false]);
        Cache::forget('employees:list:v1');

        return response()->json(status: 204);
    }
}
