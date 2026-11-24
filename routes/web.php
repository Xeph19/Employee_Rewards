<?php

use App\Http\Controllers\Api\V1\ConnectivityController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    $indexPath = public_path('index.html');
    if (! $request->expectsJson() && file_exists($indexPath)) {
        return response()->file($indexPath);
    }

    return response()->json([
        'application' => config('app.name'),
        'api' => '/api/v1',
        'status' => 'ok',
    ]);
})->name('home');

Route::get('/health', ConnectivityController::class)->name('health');
