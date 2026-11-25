<?php

namespace Database\Seeders;

use App\Enums\LedgerEntryType;
use App\Enums\RecognitionType;
use App\Enums\RoleName;
use App\Models\CompanyValue;
use App\Models\Employee;
use App\Models\Occasion;
use App\Models\Recognition;
use App\Models\Redemption;
use App\Models\Reward;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $employeeRole = Role::query()->firstOrCreate(['name' => RoleName::Employee->value], ['label' => 'Employee']);
        $managerRole = Role::query()->firstOrCreate(['name' => RoleName::Manager->value], ['label' => 'Manager']);
        $adminRole = Role::query()->firstOrCreate(['name' => RoleName::Admin->value], ['label' => 'Administrator']);

        $occasions = Occasion::query()->where('is_active', true)->get();
        $values = CompanyValue::query()->where('is_active', true)->get();
        $rewards = Reward::query()->where('is_active', true)->get();

        $departments = ['Engineering', 'Product', 'Customer Success', 'Marketing', 'People & Culture', 'Sales'];
        $titles = [
            'Engineering' => ['Frontend Engineer', 'Backend Engineer', 'DevOps Specialist', 'QA Analyst'],
            'Product' => ['Product Manager', 'UX Designer', 'Technical Writer'],
            'Customer Success' => ['Support Advocate', 'Onboarding Specialist', 'Client Partner'],
            'Marketing' => ['Content Strategist', 'Growth Marketer', 'Brand Specialist'],
            'People & Culture' => ['HR Business Partner', 'Talent Acquisition Lead'],
            'Sales' => ['Account Executive', 'Business Development Rep', 'Solutions Consultant'],
        ];

        $names = [
            'Aarav Sharma', 'Mei-Ling Tan', 'Zhi-Hao Lee', 'Chloe Tremblay', 'Liam Gallagher',
            'Siti Nurhaliza', 'Darius Wong', 'Elena Rostova', 'Kenji Sato', 'Amara Okafor',
            'Julian Vance', 'Priya Patel', 'Marcus Aurelius', 'Sofia Morales', 'Devon Brooks',
            'Hannah Lindqvist', 'Tariq Al-Mansoor', 'Natasha Romanova', 'Carlos Mendes', 'Ayla Yilmaz',
            'Elijah Scott', 'Rohan Gupta', 'Fatima Zahra', 'Wei-Lun Chen', 'Giselle Beaulieu',
            'Lucas Meyer', 'Ananya Sengupta', 'Oliver Wright', 'Zara Chen', 'Mateo Fernandez',
            'Leila Haddad', 'Jonas Berg', 'Nadia Kowalski', 'Finnian O’Connor', 'Sunita Rao',
            'Daniel Kim', 'Thandiwe Ndlovu', 'Youssef Benali', 'Kiran Joshi', 'Camila Duarte',
        ];

        $admin = User::query()->where('email', 'admin@example.com')->first();
        $manager = User::query()->where('email', 'manager@example.com')->first();

        $createdUsers = [];

        foreach ($names as $idx => $name) {
            $dept = $departments[$idx % count($departments)];
            $deptTitles = $titles[$dept];
            $title = $deptTitles[$idx % count($deptTitles)];
            $email = Str::slug($name, '.').'@example.com';
            $empNumber = 'EMP-'.str_pad((string) ($idx + 10), 3, '0', STR_PAD_LEFT);

            $user = User::query()->firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => 'password']
            );

            $user->roles()->syncWithoutDetaching([$employeeRole->id]);

            $employee = Employee::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_number' => $empNumber,
                    'department' => $dept,
                    'job_title' => $title,
                    'manager_id' => $manager?->employee?->id,
                    'joined_at' => Carbon::today()->subMonths(random_int(3, 36))->subDays(random_int(1, 28))->toDateString(),
                    'birth_date' => Carbon::today()->subYears(random_int(23, 45))->subDays(random_int(1, 350))->toDateString(),
                    'is_active' => true,
                ]
            );

            $wallet = Wallet::query()->firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0]
            );

            $createdUsers[] = $user;
        }

        // Seed 45 synthetic recognition records spanning the last 14 days
        $messages = [
            'Outstanding dedication in resolving the client incident swiftly!',
            'Exceptional teamwork during the sprint delivery milestones.',
            'Proactive initiative that streamlined our deployment pipeline.',
            'Consistently putting customers first with empathy and clarity.',
            'Superb leadership and mentoring of junior engineers on the project.',
            'Great job leading the cross-functional quarterly planning sessions.',
            'Recognised for living our company values and keeping team spirit high.',
        ];

        for ($i = 0; $i < 45; $i++) {
            $recipient = $createdUsers[$i % count($createdUsers)];
            $awarder = ($i % 3 === 0) ? $admin : $manager;
            $occasion = $occasions->isNotEmpty() ? $occasions->random() : null;
            $val = $values->isNotEmpty() ? $values->random() : null;
            $pts = (int) ($occasion?->default_points ?? (100 + ($i % 5) * 50));
            $daysAgo = $i % 14;
            $date = Carbon::now()->subDays($daysAgo)->subHours(random_int(1, 10));

            $requestKey = "demo-seed-rec-{$i}";
            if (! Recognition::query()->where('request_key', $requestKey)->exists()) {
                $rec = Recognition::query()->create([
                    'public_id' => (string) Str::uuid(),
                    'recipient_id' => $recipient->id,
                    'awarded_by' => $awarder->id,
                    'occasion_id' => $occasion?->id,
                    'type' => $occasion ? RecognitionType::Occasion : RecognitionType::AdHoc,
                    'message' => $messages[$i % count($messages)],
                    'points' => $pts,
                    'request_key' => $requestKey,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                if ($val) {
                    $rec->companyValues()->syncWithoutDetaching([$val->id]);
                }

                $w = $recipient->wallet;
                $w->increment('balance', $pts);

                $w->ledgerEntries()->create([
                    'recognition_id' => $rec->id,
                    'type' => LedgerEntryType::Credit,
                    'amount' => $pts,
                    'balance_after' => $w->balance,
                    'request_key' => $requestKey,
                    'metadata' => ['description' => "Awarded {$pts} points for {$rec->message}"],
                    'created_at' => $date,
                ]);
            }
        }

        // Seed 30 synthetic redemption records
        if ($rewards->isNotEmpty()) {
            for ($j = 0; $j < 30; $j++) {
                $user = $createdUsers[$j % count($createdUsers)];
                $reward = $rewards->random();
                $w = $user->wallet;
                $cost = (int) $reward->points_cost;

                // Ensure user has balance to redeem
                if ($w->balance < $cost) {
                    $w->increment('balance', $cost + 50);
                }

                $daysAgo = ($j % 10);
                $date = Carbon::now()->subDays($daysAgo)->subHours(random_int(1, 8));
                $ref = 'RDM-DEMO-'.str_pad((string) ($j + 100), 5, '0', STR_PAD_LEFT);
                $reqKey = "demo-seed-rdm-{$j}";

                if (! Redemption::query()->where('request_key', $reqKey)->exists()) {
                    $w->decrement('balance', $cost);

                    $rdm = Redemption::query()->create([
                        'public_id' => (string) Str::uuid(),
                        'user_id' => $user->id,
                        'wallet_id' => $w->id,
                        'reward_id' => $reward->id,
                        'points_spent' => $cost,
                        'status' => 'completed',
                        'reference' => $ref,
                        'request_key' => $reqKey,
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);

                    $w->ledgerEntries()->create([
                        'redemption_id' => $rdm->id,
                        'type' => LedgerEntryType::Debit,
                        'amount' => -$cost,
                        'balance_after' => $w->balance,
                        'request_key' => $reqKey,
                        'metadata' => ['description' => "Redeemed {$reward->name} (-{$cost} pts)"],
                        'created_at' => $date,
                    ]);
                }
            }
        }
    }
}
