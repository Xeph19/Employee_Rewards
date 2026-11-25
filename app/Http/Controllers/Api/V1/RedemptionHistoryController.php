<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedemptionHistoryController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $redemptions = $request->user()->redemptions()
            ->select(['id', 'public_id', 'user_id', 'reward_id', 'points_spent', 'status', 'reference', 'created_at'])
            ->with('reward:id,merchant_id,name', 'reward.merchant:id,name')
            ->latest('created_at')
            ->latest('id')
            ->paginate(15);

        return response()->json(['data' => $redemptions->items(), 'meta' => [
            'current_page' => $redemptions->currentPage(),
            'last_page' => $redemptions->lastPage(),
            'total' => $redemptions->total(),
        ]]);
    }
}
