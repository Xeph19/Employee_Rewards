<?php

namespace App\Actions\Rewards;

use App\Enums\LedgerEntryType;
use App\Enums\RecognitionType;
use App\Models\Recognition;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class AwardRecognition
{
    /**
     * @param  list<int>  $companyValueIds
     */
    public function handle(
        User $recipient,
        User $awarder,
        RecognitionType $type,
        string $message,
        string $requestKey,
        array $companyValueIds,
        ?int $occasionId = null,
        ?int $points = null,
        ?string $sgdAmount = null,
    ): Recognition {
        $calculatedPoints = $points ?? (int) round(((float) $sgdAmount) * config('rewards.points_per_sgd'));

        if ($calculatedPoints < 1) {
            throw new InvalidArgumentException('An award must credit at least one point.');
        }

        return DB::transaction(function () use ($recipient, $awarder, $type, $message, $requestKey, $companyValueIds, $occasionId, $calculatedPoints, $sgdAmount): Recognition {
            $existing = Recognition::query()->where('request_key', $requestKey)->first();

            if ($existing) {
                return $existing->load(['recipient', 'awarder', 'occasion', 'companyValues']);
            }

            Wallet::query()->firstOrCreate(['user_id' => $recipient->id]);
            $wallet = Wallet::query()->whereBelongsTo($recipient)->lockForUpdate()->firstOrFail();

            $recognition = Recognition::query()->create([
                'public_id' => (string) Str::uuid(),
                'recipient_id' => $recipient->id,
                'awarded_by' => $awarder->id,
                'occasion_id' => $occasionId,
                'type' => $type,
                'message' => $message,
                'points' => $calculatedPoints,
                'sgd_amount' => $sgdAmount,
                'request_key' => $requestKey,
            ]);

            $recognition->companyValues()->sync($companyValueIds);
            Wallet::query()
                ->whereKey($wallet->id)
                ->incrementEach(['balance' => $calculatedPoints, 'version' => 1]);
            $wallet->refresh();

            $wallet->ledgerEntries()->create([
                'recognition_id' => $recognition->id,
                'type' => LedgerEntryType::Credit,
                'amount' => $calculatedPoints,
                'balance_after' => $wallet->balance,
                'request_key' => $requestKey.':credit',
                'metadata' => ['awarded_by' => $awarder->id],
            ]);

            return $recognition->load(['recipient', 'awarder', 'occasion', 'companyValues']);
        }, attempts: 3);
    }
}
