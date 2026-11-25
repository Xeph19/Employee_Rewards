<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\MessageSuggestionRequest;
use App\Models\Occasion;
use App\Services\MessageSuggestionService;
use Illuminate\Http\JsonResponse;

class MessageSuggestionController extends Controller
{
    public function __invoke(MessageSuggestionRequest $request, MessageSuggestionService $suggestions): JsonResponse
    {
        $data = $request->validated();

        return response()->json(['data' => $suggestions->suggest(
            isset($data['occasion_id']) ? Occasion::query()->find($data['occasion_id']) : null,
            $data['company_value_ids'] ?? [],
            $data['recipient_name'] ?? null,
        )]);
    }
}
