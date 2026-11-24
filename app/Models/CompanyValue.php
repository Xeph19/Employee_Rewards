<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'description', 'color', 'is_active'])]
class CompanyValue extends Model
{
    public function occasions(): BelongsToMany
    {
        return $this->belongsToMany(Occasion::class);
    }

    public function recognitions(): BelongsToMany
    {
        return $this->belongsToMany(Recognition::class);
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
