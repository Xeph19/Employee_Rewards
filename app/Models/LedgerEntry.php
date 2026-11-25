<?php

namespace App\Models;

use App\Enums\LedgerEntryType;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $wallet_id
 * @property int|null $recognition_id
 * @property int|null $redemption_id
 * @property LedgerEntryType $type
 * @property int $amount
 * @property int $balance_after
 * @property string|null $request_key
 * @property array<string, mixed>|null $metadata
 * @property CarbonImmutable|null $created_at
 * @property-read Wallet|null $wallet
 * @property-read Recognition|null $recognition
 * @property-read Redemption|null $redemption
 */
#[Fillable(['wallet_id', 'recognition_id', 'redemption_id', 'type', 'amount', 'balance_after', 'request_key', 'metadata'])]
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

    public function redemption(): BelongsTo
    {
        return $this->belongsTo(Redemption::class);
    }

    protected function casts(): array
    {
        return ['type' => LedgerEntryType::class, 'metadata' => 'array'];
    }
}
