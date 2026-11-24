<?php

namespace App\Http\Controllers\Api\V1;

use App\Facades\Rewards;
use App\Http\Controllers\Controller;
use App\Http\Requests\RevokeRecognitionRequest;
use App\Models\Recognition;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class RevokedRecognitionController extends Controller
{
    public function store(RevokeRecognitionRequest $request, Recognition $recognition): JsonResponse
    {
        $data = $request->validated();
        $revoked = Rewards::revoke($recognition, $request->user(), $data['reason']);

        Cache::forget('recognitions:feed:v1');

        return response()->json([
            'data' => $revoked,
        ]);
    }
}
