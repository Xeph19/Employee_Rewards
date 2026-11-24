<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'default_points', 'is_active'])]
class Occasion extends Model
{
    public function companyValues(): BelongsToMany
    {
        return $this->belongsToMany(CompanyValue::class);
    }

    public function recognitions(): HasMany
    {
        return $this->hasMany(Recognition::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
