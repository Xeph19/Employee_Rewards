<?php

namespace App\Services;

use App\Models\Merchant;
use App\Models\Reward;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CatalogueService
{
    public function categories(): array
    {
        return Cache::remember('catalogue:categories:v1', 300, fn () => Merchant::query()->active()->distinct()->orderBy('category')->pluck('category')->all()
        );
    }

    public function search(?string $search, ?string $category, int $perPage): LengthAwarePaginator
    {
        $term = Str::lower(trim((string) $search));

        return Reward::query()
            ->select(['id', 'merchant_id', 'name', 'slug', 'description', 'points_cost', 'stock_quantity', 'starts_at', 'ends_at'])
            ->available()
            ->with('merchant:id,name,slug,category')
            ->when($term !== '', function (Builder $query) use ($term): void {
                $query->where(function (Builder $searchQuery) use ($term): void {
                    $searchQuery
                        ->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$term}%"])
                        ->orWhereHas('merchant', fn (Builder $merchant) => $merchant->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"]));
                });
            })
            ->when($category, fn (Builder $query, string $value) => $query->whereHas('merchant', fn (Builder $merchant) => $merchant->where('category', $value)))
            ->orderBy('points_cost')
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();
    }
}
