<?php

namespace App\Actions\Rewards;

use App\Enums\LedgerEntryType;
use App\Models\Recognition;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RevokeRecognition
{
    public function handle(Recognition $recognition, User $revokedBy, string $reason): Recognition
    {
        return DB::transaction(function () use ($recognition, $revokedBy, $reason): Recognition {
            $lockedRecognition = Recognition::query()->lockForUpdate()->findOrFail($recognition->id);

            if ($lockedRecognition->revoked_at) {
                return $lockedRecognition;
            }

            $wallet = Wallet::query()
                ->where('user_id', $lockedRecognition->recipient_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($wallet->balance < $lockedRecognition->points) {
                throw ValidationException::withMessages([
                    'recognition' => 'This award cannot be revoked because its points have already been spent.',
                ]);
            }

            $wallet->decrement('balance', $lockedRecognition->points);
            $wallet->increment('version');
            $wallet->refresh();

            $wallet->ledgerEntries()->create([
                'recognition_id' => $lockedRecognition->id,
                'type' => LedgerEntryType::Reversal,
                'amount' => -$lockedRecognition->points,
                'balance_after' => $wallet->balance,
                'request_key' => $lockedRecognition->request_key.':reversal',
                'metadata' => ['revoked_by' => $revokedBy->id, 'reason' => $reason],
            ]);

            $lockedRecognition->update([
                'revoked_at' => now(),
                'revoked_by' => $revokedBy->id,
                'revocation_reason' => $reason,
            ]);

            return $lockedRecognition->refresh();
        }, attempts: 3);
    }
}
