<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRedemptionRequest;
use App\Models\Reward;
use App\Services\RedemptionService;
use Illuminate\Http\JsonResponse;

class RedemptionController extends Controller
{
    public function store(StoreRedemptionRequest $request, RedemptionService $redemptions): JsonResponse
    {
        $redemption = $redemptions->redeem(
            $request->user(),
            Reward::query()->findOrFail($request->integer('reward_id')),
            $request->string('request_key')->toString(),
        );

        return response()->json(['data' => $redemption], 201);
    }
}
