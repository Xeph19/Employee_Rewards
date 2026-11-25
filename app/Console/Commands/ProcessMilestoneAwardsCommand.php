<?php

namespace App\Console\Commands;

use App\Enums\RecognitionType;
use App\Facades\Rewards;
use App\Models\Employee;
use App\Models\Occasion;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ProcessMilestoneAwardsCommand extends Command
{
    protected $signature = 'rewards:process-milestones {--date= : The date to evaluate (Y-m-d)}';

    protected $description = 'Automatically grant awards for employee birthdays and work anniversaries.';

    public function handle(): int
    {
        $targetDate = $this->option('date') ? Carbon::parse($this->option('date')) : Carbon::today();
        $this->info("Processing milestones for date: {$targetDate->toDateString()}");

        $systemAdmin = User::query()->whereHas('roles', fn ($q) => $q->where('name', 'admin'))->first();

        if (! $systemAdmin) {
            $this->error('No admin user found to act as awarder.');

            return self::FAILURE;
        }

        $birthdayOccasion = Occasion::query()->where('name', 'like', '%Birthday%')->first();
        $anniversaryOccasion = Occasion::query()->where('name', 'like', '%Anniversary%')->first();

        $activeEmployees = Employee::query()
            ->with('user')
            ->where('is_active', true)
            ->get();

        $awardedCount = 0;

        foreach ($activeEmployees as $employee) {
            $user = $employee->user;
            if (! $user) {
                continue;
            }

            // Birthday check (month and day)
            if ($employee->birth_date && $birthdayOccasion) {
                $birthDate = Carbon::parse($employee->birth_date);
                if ($birthDate->month === $targetDate->month && $birthDate->day === $targetDate->day) {
                    $requestKey = "auto-birthday-{$employee->id}-{$targetDate->year}";
                    try {
                        Rewards::award(
                            recipient: $user,
                            awarder: $systemAdmin,
                            type: RecognitionType::Occasion,
                            message: "Happy Birthday, {$user->name}! Wishing you a fantastic day and year ahead.",
                            requestKey: $requestKey,
                            companyValueIds: [],
                            occasionId: $birthdayOccasion->id,
                            points: $birthdayOccasion->default_points ?? 100,
                        );
                        $this->line("Granted birthday award to {$user->name}");
                        $awardedCount++;
                    } catch (\Throwable $e) {
                        // Skip if already awarded for this request key
                    }
                }
            }

            // Work anniversary check
            if ($employee->joined_at && $anniversaryOccasion) {
                $joinedAt = Carbon::parse($employee->joined_at);
                if ($joinedAt->month === $targetDate->month && $joinedAt->day === $targetDate->day && $joinedAt->year < $targetDate->year) {
                    $years = $targetDate->year - $joinedAt->year;
                    $requestKey = "auto-anniversary-{$employee->id}-{$targetDate->year}";
                    try {
                        Rewards::award(
                            recipient: $user,
                            awarder: $systemAdmin,
                            type: RecognitionType::Occasion,
                            message: "Happy {$years}-year work anniversary, {$user->name}! Thank you for your enduring contributions.",
                            requestKey: $requestKey,
                            companyValueIds: [],
                            occasionId: $anniversaryOccasion->id,
                            points: ($anniversaryOccasion->default_points ?? 200) * max(1, min($years, 5)),
                        );
                        $this->line("Granted anniversary award to {$user->name} ({$years} years)");
                        $awardedCount++;
                    } catch (\Throwable $e) {
                        // Skip if already awarded
                    }
                }
            }
        }

        $this->info("Completed milestone awards. Total granted: {$awardedCount}");

        return self::SUCCESS;
    }
}
