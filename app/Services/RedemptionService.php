<?php

namespace App\Services;

use App\Enums\LedgerEntryType;
use App\Models\Redemption;
use App\Models\Reward;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RedemptionService
{
    public function redeem(User $user, Reward $reward, string $requestKey): Redemption
    {
        return DB::transaction(function () use ($user, $reward, $requestKey): Redemption {
            $wallet = Wallet::query()->whereBelongsTo($user)->lockForUpdate()->firstOrFail();
            $existing = Redemption::query()->whereBelongsTo($user)->where('request_key', $requestKey)->first();

            if ($existing) {
                return $existing->load('reward.merchant');
            }

            $lockedReward = Reward::query()->with('merchant')->lockForUpdate()->findOrFail($reward->id);
            $available = $lockedReward->is_active
                && $lockedReward->merchant->is_active
                && ($lockedReward->starts_at === null || $lockedReward->starts_at->isPast())
                && ($lockedReward->ends_at === null || $lockedReward->ends_at->isFuture())
                && ($lockedReward->stock_quantity === null || $lockedReward->stock_quantity > 0);

            if (! $available) {
                throw ValidationException::withMessages(['reward_id' => 'This reward is no longer available.']);
            }

            if ($wallet->balance < $lockedReward->points_cost) {
                throw ValidationException::withMessages(['reward_id' => 'Your points balance is insufficient for this reward.']);
            }

            $redemption = Redemption::query()->create([
                'public_id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'reward_id' => $lockedReward->id,
                'points_spent' => $lockedReward->points_cost,
                'status' => 'completed',
                'reference' => 'RDM-'.Str::upper(Str::random(12)),
                'request_key' => $requestKey,
            ]);

            $wallet->decrement('balance', $lockedReward->points_cost);
            $wallet->increment('version');
            $wallet->refresh();

            if ($lockedReward->stock_quantity !== null) {
                $lockedReward->decrement('stock_quantity');
            }

            $wallet->ledgerEntries()->create([
                'redemption_id' => $redemption->id,
                'type' => LedgerEntryType::Debit,
                'amount' => -$lockedReward->points_cost,
                'balance_after' => $wallet->balance,
                'request_key' => "redemption:{$redemption->id}:debit",
                'metadata' => ['reward_id' => $lockedReward->id, 'reference' => $redemption->reference],
            ]);

            return $redemption->load('reward.merchant');
        }, attempts: 3);
    }
}
