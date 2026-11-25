<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use App\Models\Recognition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    public function employee(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user->wallet;

        $recognitionsReceived = Recognition::query()
            ->where('recipient_id', $user->id)
            ->whereNull('revoked_at')
            ->count();

        $recognitionsGiven = Recognition::query()
            ->where('awarded_by', $user->id)
            ->whereNull('revoked_at')
            ->count();

        $pointsEarned = (int) LedgerEntry::query()
            ->where('wallet_id', $wallet?->id)
            ->where('amount', '>', 0)
            ->sum('amount');

        $pointsSpent = (int) abs((int) LedgerEntry::query()
            ->where('wallet_id', $wallet?->id)
            ->where('amount', '<', 0)
            ->sum('amount'));

        $recentLedger = LedgerEntry::query()
            ->where('wallet_id', $wallet?->id)
            ->latest('id')
            ->limit(10)
            ->get();

        $redeemedRewards = $user->redemptions()
            ->select(['id', 'public_id', 'user_id', 'reward_id', 'points_spent', 'status', 'reference', 'created_at'])
            ->with('reward:id,merchant_id,name,description,category', 'reward.merchant:id,name,category')
            ->latest('created_at')
            ->latest('id')
            ->limit(12)
            ->get();

        return response()->json([
            'data' => [
                'balance' => $wallet->balance ?? 0,
                'recognitions_received' => $recognitionsReceived,
                'recognitions_given' => $recognitionsGiven,
                'points_earned' => $pointsEarned,
                'points_spent' => $pointsSpent,
                'recent_ledger' => $recentLedger,
                'redeemed_rewards' => $redeemedRewards,
            ],
        ]);
    }

    public function personalExport(Request $request): StreamedResponse
    {
        $user = $request->user();
        $wallet = $user->wallet;
        $format = Str::lower($request->query('format', 'csv'));
        $filename = 'my_reward_statement_'.now()->format('Ymd_His');

        $query = $wallet
            ? LedgerEntry::query()->where('wallet_id', $wallet->id)->orderBy('id', 'asc')
            : LedgerEntry::query()->whereRaw('1 = 0');

        switch ($format) {
            case 'tsv':
                return response()->stream(function () use ($query): void {
                    $handle = fopen('php://output', 'w');
                    fputcsv($handle, ['ID', 'Type', 'Amount', 'Balance After', 'Description', 'Date'], "\t");
                    $query->chunk(200, function ($entries) use ($handle): void {
                        foreach ($entries as $entry) {
                            fputcsv($handle, [
                                $entry->id,
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

            case 'xml':
                return response()->stream(function () use ($query): void {
                    $handle = fopen('php://output', 'w');
                    fwrite($handle, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<statement>\n");
                    $query->chunk(200, function ($entries) use ($handle): void {
                        foreach ($entries as $entry) {
                            $xml = "  <entry id=\"{$entry->id}\">\n"
                                .'    <type>'.htmlspecialchars($entry->type->value)."</type>\n"
                                ."    <amount>{$entry->amount}</amount>\n"
                                ."    <balance_after>{$entry->balance_after}</balance_after>\n"
                                .'    <description>'.htmlspecialchars((string) ($entry->metadata['description'] ?? $entry->type->value))."</description>\n"
                                .'    <date>'.htmlspecialchars((string) $entry->created_at?->toIso8601String())."</date>\n"
                                ."  </entry>\n";
                            fwrite($handle, $xml);
                        }
                    });
                    fwrite($handle, "</statement>\n");
                    fclose($handle);
                }, 200, [
                    'Content-Type' => 'application/xml',
                    'Content-Disposition' => "attachment; filename=\"{$filename}.xml\"",
                ]);

            case 'xlsx':
            case 'csv':
            default:
                $ext = $format === 'xlsx' ? 'xlsx' : 'csv';
                $contentType = $format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';

                return response()->stream(function () use ($query): void {
                    $handle = fopen('php://output', 'w');
                    fputcsv($handle, ['ID', 'Type', 'Amount', 'Balance After', 'Description', 'Date']);
                    $query->chunk(200, function ($entries) use ($handle): void {
                        foreach ($entries as $entry) {
                            fputcsv($handle, [
                                $entry->id,
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
    }
}
