<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CatalogueRequest;
use App\Services\CatalogueService;
use Illuminate\Http\JsonResponse;

class CatalogueController extends Controller
{
    public function __invoke(CatalogueRequest $request, CatalogueService $catalogue): JsonResponse
    {
        $rewards = $catalogue->search(
            $request->validated('search'),
            $request->validated('category'),
            $request->integer('per_page', 12),
        );

        return response()->json([
            'data' => $rewards->items(),
            'meta' => [
                'current_page' => $rewards->currentPage(),
                'last_page' => $rewards->lastPage(),
                'per_page' => $rewards->perPage(),
                'total' => $rewards->total(),
                'categories' => $catalogue->categories(),
            ],
        ]);
    }
}
