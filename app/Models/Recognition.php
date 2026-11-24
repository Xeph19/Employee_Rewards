<?php

namespace App\Models;

use App\Enums\RecognitionType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['public_id', 'recipient_id', 'awarded_by', 'occasion_id', 'type', 'message', 'points', 'sgd_amount', 'request_key', 'revoked_at', 'revoked_by', 'revocation_reason'])]
class Recognition extends Model
{
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function awarder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'awarded_by');
    }

    public function occasion(): BelongsTo
    {
        return $this->belongsTo(Occasion::class);
    }

    public function companyValues(): BelongsToMany
    {
        return $this->belongsToMany(CompanyValue::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class);
    }

    protected function casts(): array
    {
        return [
            'type' => RecognitionType::class,
            'sgd_amount' => 'decimal:2',
            'revoked_at' => 'datetime',
        ];
    }
}
