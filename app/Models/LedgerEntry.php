<?php

namespace App\Models;

use App\Enums\LedgerEntryType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['wallet_id', 'recognition_id', 'type', 'amount', 'balance_after', 'request_key', 'metadata'])]
class LedgerEntry extends Model
{
    public const UPDATED_AT = null;

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function recognition(): BelongsTo
    {
        return $this->belongsTo(Recognition::class);
    }

    protected function casts(): array
    {
        return ['type' => LedgerEntryType::class, 'metadata' => 'array'];
    }
}
