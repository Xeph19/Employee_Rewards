<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RoleName;
use App\Http\Controllers\Controller;
use App\Models\CompanyValue;
use App\Models\Employee;
use App\Models\Occasion;
use App\Models\Recognition;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing([
            'roles:id,name,label',
            'employee:id,user_id,manager_id,employee_number,department,job_title,is_active',
            'wallet:id,user_id,balance,version',
        ]);
        $isAdmin = $user->hasRole(RoleName::Admin);
        $canAward = $user->can('create', Recognition::class);
        $userEmployeeId = $user->employee?->id;

        $recipients = User::query()
            ->select(['id', 'name', 'email'])
            ->with('employee:id,user_id,manager_id,department,job_title')
            ->when(! $canAward, fn ($query) => $query->whereRaw('1 = 0'))
            ->when(
                $canAward && ! $isAdmin,
                fn ($query) => $query->whereHas(
                    'employee',
                    fn ($emp) => $emp->where('manager_id', $userEmployeeId)->where('is_active', true),
                ),
            )
            ->when(
                $canAward && $isAdmin,
                fn ($query) => $query->whereHas(
                    'employee',
                    fn ($emp) => $emp->where('is_active', true),
                ),
            )
            ->where('id', '!=', $user->id)
            ->orderBy('name')
            ->get();

        $occasions = Cache::remember(
            $isAdmin ? 'occasions:all:v1' : 'occasions:active:v1',
            120,
            fn () => $isAdmin
                ? Occasion::query()->with('companyValues:id,name,color')->orderBy('name')->get()
                : Occasion::query()->active()->with('companyValues:id,name,color')->orderBy('name')->get()
        );

        $companyValues = Cache::remember(
            $isAdmin ? 'company_values:all:v1' : 'company_values:active:v1',
            120,
            fn () => $isAdmin
                ? CompanyValue::query()->orderBy('name')->get()
                : CompanyValue::query()->active()->orderBy('name')->get()
        );

        $recognitions = Cache::remember('recognitions:feed:v1', 30, function () {
            return Recognition::query()
                ->select([
                    'id',
                    'public_id',
                    'recipient_id',
                    'awarded_by',
                    'occasion_id',
                    'message',
                    'points',
                    'created_at',
                ])
                ->whereNull('revoked_at')
                ->with([
                    'recipient:id,name',
                    'awarder:id,name',
                    'occasion:id,name',
                    'companyValues:id,name,color',
                ])
                ->latest('created_at')
                ->latest('id')
                ->limit(50)
                ->get();
        });

        return response()->json([
            'data' => [
                'user' => $user,
                'wallet' => $user->wallet,
                'roles' => $user->roles->pluck('name')->values(),
                'permissions' => [
                    'award' => $canAward,
                    'manage' => $isAdmin,
                    'view_employees' => $user->can('viewAny', Employee::class),
                ],
                'recipients' => $recipients,
                'occasions' => $occasions,
                'company_values' => $companyValues,
                'recognitions' => $recognitions,
                'points_per_sgd' => config('rewards.points_per_sgd'),
            ],
        ]);
    }
}
