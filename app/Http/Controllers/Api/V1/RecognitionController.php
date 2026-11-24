<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RecognitionType;
use App\Facades\Rewards;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecognitionRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class RecognitionController extends Controller
{
    public function store(StoreRecognitionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $recognition = Rewards::award(
            recipient: User::query()->findOrFail($data['recipient_id']),
            awarder: $request->user(),
            type: RecognitionType::from($data['type']),
            message: $data['message'],
            requestKey: $data['request_key'],
            companyValueIds: $data['company_value_ids'],
            occasionId: $data['occasion_id'] ?? null,
            points: isset($data['points']) ? (int) $data['points'] : null,
            sgdAmount: isset($data['sgd_amount']) ? (string) $data['sgd_amount'] : null,
        );

        Cache::forget('recognitions:feed:v1');

        return response()->json(['data' => $recognition], 201);
    }
}
