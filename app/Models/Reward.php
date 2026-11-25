<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $merchant_id
 * @property int $points_cost
 * @property int|null $stock_quantity
 * @property bool $is_active
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property-read Merchant $merchant
 */
#[Fillable(['merchant_id', 'name', 'slug', 'description', 'points_cost', 'stock_quantity', 'is_active', 'starts_at', 'ends_at'])]
class Reward extends Model
{
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(Redemption::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->whereHas('merchant', fn (Builder $merchant) => $merchant->where('is_active', true))
            ->where(fn (Builder $dates) => $dates->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn (Builder $dates) => $dates->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->where(fn (Builder $stock) => $stock->whereNull('stock_quantity')->orWhere('stock_quantity', '>', 0));
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }
}
