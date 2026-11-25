<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RoleName;
use App\Http\Controllers\Controller;
use App\Models\CompanyValue;
use App\Models\Employee;
use App\Models\LedgerEntry;
use App\Models\Occasion;
use App\Models\Recognition;
use App\Models\Redemption;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $request->user()->hasRole(RoleName::Admin) || abort(403, 'Unauthorized.');

        // Common filter inputs
        $department = $request->query('department');
        $timeframe = (int) $request->query('timeframe', 14); // 7, 14, or 30 days
        $occasionId = $request->query('occasion_id') ? (int) $request->query('occasion_id') : null;

        $startDate = Carbon::today()->subDays($timeframe - 1);

        $totalUsersQuery = User::query();
        if ($department) {
            $totalUsersQuery->whereHas('employee', fn ($q) => $q->where('department', $department));
        }
        $totalUsers = $totalUsersQuery->count();

        // Recognitions query with filters
        $recognitionQuery = Recognition::query()
            ->whereNull('revoked_at')
            ->where('created_at', '>=', $startDate->startOfDay())
            ->when($occasionId, fn ($q) => $q->where('occasion_id', $occasionId))
            ->when($department, fn ($q) => $q->whereHas('recipient.employee', fn ($e) => $e->where('department', $department)));

        $totalRecognitions = (clone $recognitionQuery)->count();
        $totalPointsAwarded = (int) (clone $recognitionQuery)->sum('points');

        // Redemptions query with filters
        $redemptionQuery = Redemption::query()
            ->where('created_at', '>=', $startDate->startOfDay())
            ->when($department, fn ($q) => $q->whereHas('user.employee', fn ($e) => $e->where('department', $department)));

        $totalRedemptions = (clone $redemptionQuery)->count();
        $totalPointsRedeemed = (int) (clone $redemptionQuery)->sum('points_spent');

        // Total balance across filtered users
        $totalBalance = (int) Wallet::query()
            ->when($department, fn ($q) => $q->whereHas('user.employee', fn ($e) => $e->where('department', $department)))
            ->sum('balance');

        // 1. Chart 1: Activity Velocity Over Time (Line Chart)
        $dateList = collect(range($timeframe - 1, 0))->map(fn ($daysAgo) => Carbon::today()->subDays($daysAgo)->toDateString());

        $velocityRecognitions = (clone $recognitionQuery)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        $velocityRedemptions = (clone $redemptionQuery)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        $chartVelocity = [
            'labels' => $dateList->map(fn ($d) => Carbon::parse($d)->format('M d'))->values(),
            'recognitions' => $dateList->map(fn ($d) => (int) ($velocityRecognitions[$d] ?? 0))->values(),
            'redemptions' => $dateList->map(fn ($d) => (int) ($velocityRedemptions[$d] ?? 0))->values(),
        ];

        // 2. Chart 2: Points by Department (Bar Chart)
        $departments = Employee::query()->distinct()->whereNotNull('department')->pluck('department')->all();
        $deptPoints = [];
        foreach ($departments as $dept) {
            $deptPoints[$dept] = (int) Recognition::query()
                ->whereNull('revoked_at')
                ->where('created_at', '>=', $startDate->startOfDay())
                ->when($occasionId, fn ($q) => $q->where('occasion_id', $occasionId))
                ->whereHas('recipient.employee', fn ($e) => $e->where('department', $dept))
                ->sum('points');
        }

        $chartDepartment = [
            'labels' => array_keys($deptPoints),
            'data' => array_values($deptPoints),
        ];

        // 3. Chart 3: Recognitions by Occasion (Doughnut Chart)
        $occasionsData = Occasion::query()
            ->select(['id', 'name'])
            ->withCount(['recognitions' => function ($q) use ($startDate, $department): void {
                $q->whereNull('revoked_at')
                    ->where('created_at', '>=', $startDate->startOfDay())
                    ->when($department, fn ($sub) => $sub->whereHas('recipient.employee', fn ($e) => $e->where('department', $department)));
            }])
            ->get();

        $chartOccasions = [
            'labels' => $occasionsData->pluck('name')->values(),
            'data' => $occasionsData->pluck('recognitions_count')->values(),
        ];

        // 4. Chart 4: Company Values Impact (Polar Area / Bar Chart)
        $valuesData = CompanyValue::query()
            ->select(['id', 'name'])
            ->withCount(['recognitions' => function ($q) use ($startDate, $department, $occasionId): void {
                $q->whereNull('revoked_at')
                    ->where('created_at', '>=', $startDate->startOfDay())
                    ->when($occasionId, fn ($sub) => $sub->where('occasion_id', $occasionId))
                    ->when($department, fn ($sub) => $sub->whereHas('recipient.employee', fn ($e) => $e->where('department', $department)));
            }])
            ->get();

        $chartValues = [
            'labels' => $valuesData->pluck('name')->values(),
            'data' => $valuesData->pluck('recognitions_count')->values(),
        ];

        // Employee balance table with pagination
        $balancePage = (int) $request->query('balance_page', 1);
        $balancePerPage = (int) $request->query('balance_per_page', 10);

        $balancesQuery = User::query()
            ->select(['id', 'name', 'email'])
            ->with(['employee:id,user_id,department,job_title,is_active', 'wallet:id,user_id,balance'])
            ->when($department, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('department', $department)))
            ->orderBy('name');

        $paginatedBalances = $balancesQuery->paginate($balancePerPage, ['*'], 'balance_page', $balancePage);

        $employeeBalances = collect($paginatedBalances->items())->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'department' => $u->employee->department ?? '-',
            'job_title' => $u->employee->job_title ?? '-',
            'is_active' => $u->employee->is_active ?? true,
            'balance' => $u->wallet->balance ?? 0,
        ]);

        return response()->json([
            'data' => [
                'totals' => [
                    'total_users' => $totalUsers,
                    'total_balance' => $totalBalance,
                    'total_points_awarded' => $totalPointsAwarded,
                    'total_points_redeemed' => $totalPointsRedeemed,
                    'total_recognitions' => $totalRecognitions,
                    'total_redemptions' => $totalRedemptions,
                ],
                'filter_options' => [
                    'departments' => $departments,
                    'occasions' => Occasion::query()->where('is_active', true)->select(['id', 'name'])->get(),
                ],
                'charts' => [
                    'velocity' => $chartVelocity,
                    'departments' => $chartDepartment,
                    'occasions' => $chartOccasions,
                    'company_values' => $chartValues,
                ],
                'employee_balances' => $employeeBalances,
                'balance_meta' => [
                    'current_page' => $paginatedBalances->currentPage(),
                    'last_page' => $paginatedBalances->lastPage(),
                    'per_page' => $paginatedBalances->perPage(),
                    'total' => $paginatedBalances->total(),
                ],
            ],
        ]);
    }

    public function systemExport(Request $request): StreamedResponse
    {
        $request->user()->hasRole(RoleName::Admin) || abort(403, 'Unauthorized.');
        $format = Str::lower($request->query('format', 'csv'));

        $query = LedgerEntry::query()->with('wallet.user')->orderBy('id', 'asc');

        $filename = 'system_rewards_audit_'.now()->format('Ymd_His');

        switch ($format) {
            case 'tsv':
                return $this->exportTsv($query, $filename);
            case 'xml':
                return $this->exportXml($query, $filename);
            case 'xlsx':
            case 'csv':
            default:
                return $this->exportCsv($query, $filename, $format === 'xlsx');
        }
    }

    private function exportCsv($query, string $filename, bool $isXlsxMime = false): StreamedResponse
    {
        $ext = $isXlsxMime ? 'xlsx' : 'csv';
        $contentType = $isXlsxMime ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';

        return response()->stream(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Ledger ID', 'User ID', 'User Name', 'User Email', 'Type', 'Amount', 'Balance After', 'Description', 'Timestamp']);

            $query->chunk(200, function ($entries) use ($handle): void {
                foreach ($entries as $entry) {
                    /** @var Wallet|null $entryWallet */
                    $entryWallet = $entry->wallet;
                    /** @var User|null $user */
                    $user = $entryWallet?->user;
                    fputcsv($handle, [
                        $entry->id,
                        $user?->id,
                        $user?->name,
                        $user?->email,
                        $entry->type->value,
                        $entry->amount,
                        $entry->balance_after,
                        (string) ($entry->metadata['description'] ?? $entry->type->value),
                        (string) $entry->created_at?->toIso8601String(),
                    ]);
                }
            });

            fclose($handle);
        }, 200, [
            'Content-Type' => $contentType,
            'Content-Disposition' => "attachment; filename=\"{$filename}.{$ext}\"",
        ]);
    }

    private function exportTsv($query, string $filename): StreamedResponse
    {
        return response()->stream(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Ledger ID', 'User ID', 'User Name', 'User Email', 'Type', 'Amount', 'Balance After', 'Description', 'Timestamp'], "\t");

            $query->chunk(200, function ($entries) use ($handle): void {
                foreach ($entries as $entry) {
                    /** @var Wallet|null $entryWallet */
                    $entryWallet = $entry->wallet;
                    /** @var User|null $user */
                    $user = $entryWallet?->user;
                    fputcsv($handle, [
                        $entry->id,
                        $user?->id,
                        $user?->name,
                        $user?->email,
                        $entry->type->value,
                        $entry->amount,
                        $entry->balance_after,
                        (string) ($entry->metadata['description'] ?? $entry->type->value),
                        (string) $entry->created_at?->toIso8601String(),
                    ], "\t");
                }
            });

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/tab-separated-values',
            'Content-Disposition' => "attachment; filename=\"{$filename}.tsv\"",
        ]);
    }

    private function exportXml($query, string $filename): StreamedResponse
    {
        return response()->stream(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<audit_log>\n");

            $query->chunk(200, function ($entries) use ($handle): void {
                foreach ($entries as $entry) {
                    /** @var Wallet|null $entryWallet */
                    $entryWallet = $entry->wallet;
                    /** @var User|null $user */
                    $user = $entryWallet?->user;

                    $xml = "  <entry id=\"{$entry->id}\">\n"
                        .'    <user_id>'.htmlspecialchars((string) $user?->id)."</user_id>\n"
                        .'    <user_name>'.htmlspecialchars((string) $user?->name)."</user_name>\n"
                        .'    <user_email>'.htmlspecialchars((string) $user?->email)."</user_email>\n"
                        .'    <type>'.htmlspecialchars($entry->type->value)."</type>\n"
                        ."    <amount>{$entry->amount}</amount>\n"
                        ."    <balance_after>{$entry->balance_after}</balance_after>\n"
                        .'    <description>'.htmlspecialchars((string) ($entry->metadata['description'] ?? $entry->type->value))."</description>\n"
                        .'    <timestamp>'.htmlspecialchars((string) $entry->created_at?->toIso8601String())."</timestamp>\n"
                        ."  </entry>\n";
                    fwrite($handle, $xml);
                }
            });

            fwrite($handle, "</audit_log>\n");
            fclose($handle);
        }, 200, [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => "attachment; filename=\"{$filename}.xml\"",
        ]);
    }
}
