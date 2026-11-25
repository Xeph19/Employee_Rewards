<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['public_id', 'user_id', 'wallet_id', 'reward_id', 'points_spent', 'status', 'reference', 'request_key'])]
class Redemption extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }

    public function ledgerEntry(): HasOne
    {
        return $this->hasOne(LedgerEntry::class);
    }
}
