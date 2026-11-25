<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RoleName;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRewardRequest;
use App\Models\Merchant;
use App\Models\Reward;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminRewardController extends Controller
{
    public function merchants(Request $request): JsonResponse
    {
        $request->user()->hasRole(RoleName::Admin) || abort(403);

        $merchants = Merchant::query()
            ->select(['id', 'name', 'category'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $merchants]);
    }

    public function store(StoreRewardRequest $request): JsonResponse
    {
        $data = $request->validated();
        $slug = Str::slug($data['name']).'-'.Str::lower(Str::random(6));

        $reward = Reward::query()->create([
            'merchant_id' => $data['merchant_id'],
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'points_cost' => $data['points_cost'],
            'stock_quantity' => $data['stock_quantity'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Reward created successfully.',
            'data' => $reward->load('merchant:id,name,slug,category'),
        ], 201);
    }
}
