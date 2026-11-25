<?php

namespace Database\Seeders;

use App\Models\Merchant;
use App\Models\Reward;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MerchantRewardSeeder extends Seeder
{
    public function run(): void
    {
        $areas = ['Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Timah', 'Changi', 'Clementi', 'Geylang', 'Hougang', 'Jurong', 'Katong', 'Novena', 'Orchard', 'Punggol', 'Queenstown', 'Sembawang', 'Serangoon', 'Tampines', 'Tiong Bahru', 'Toa Payoh', 'Woodlands'];
        $brands = ['Bites', 'Brew', 'Collective', 'Corner', 'Craft', 'Daily', 'Delights', 'Essentials', 'Garden', 'Market'];
        $categories = ['Dining', 'Groceries', 'Wellness', 'Lifestyle', 'Entertainment'];
        $now = now();

        $merchants = collect(range(1, 100))->map(function (int $number) use ($areas, $brands, $categories, $now): array {
            $name = $areas[($number - 1) % count($areas)].' '.$brands[($number - 1) % count($brands)].' '.str_pad((string) $number, 3, '0', STR_PAD_LEFT);

            return [
                'name' => $name,
                'slug' => Str::slug($name),
                'category' => $categories[($number - 1) % count($categories)],
                'description' => 'A fictional Singapore merchant created for the BrightThanks rewards catalogue.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        });

        Merchant::query()->upsert($merchants->all(), ['slug'], ['name', 'category', 'description', 'is_active', 'updated_at']);
        $merchantIds = Merchant::query()->whereIn('slug', $merchants->pluck('slug'))->pluck('id', 'slug');

        $rewards = $merchants->values()->map(function (array $merchant, int $index) use ($merchantIds, $now): array {
            $rewardName = match ($merchant['category']) {
                'Dining' => '$10 dining voucher',
                'Groceries' => '$10 grocery voucher',
                'Wellness' => 'Wellness experience voucher',
                'Lifestyle' => 'Lifestyle gift voucher',
                default => 'Entertainment pass',
            };

            return [
                'merchant_id' => $merchantIds[$merchant['slug']],
                'name' => $rewardName,
                'slug' => $merchant['slug'].'-reward',
                'description' => 'Redeem this fictional reward at '.$merchant['name'].'.',
                'points_cost' => 100 + (($index % 10) * 50),
                'stock_quantity' => 25 + ($index % 50),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        });

        Reward::query()->upsert($rewards->all(), ['slug'], ['merchant_id', 'name', 'description', 'points_cost', 'stock_quantity', 'is_active', 'updated_at']);
    }
}
