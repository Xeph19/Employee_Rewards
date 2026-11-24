<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class ConnectivityController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::selectOne('select 1 as healthy');

            return response()->json([
                'status' => 'ok',
                'services' => ['api' => 'connected', 'database' => 'connected'],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'status' => 'unavailable',
                'services' => ['api' => 'connected', 'database' => 'unavailable'],
            ], 503);
        }
    }
}
