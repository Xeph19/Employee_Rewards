<?php

use App\Http\Controllers\Api\V1\AuthenticatedSessionController;
use App\Http\Controllers\Api\V1\CompanyValueController;
use App\Http\Controllers\Api\V1\ConnectivityController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\OccasionController;
use App\Http\Controllers\Api\V1\RecognitionController;
use App\Http\Controllers\Api\V1\RevokedRecognitionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/connectivity', ConnectivityController::class)->name('api.connectivity');
    Route::get('/health', ConnectivityController::class)->name('api.health');
    Route::post('/session', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('api.session.store');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::delete('/session', [AuthenticatedSessionController::class, 'destroy'])->name('api.session.destroy');
        Route::get('/dashboard', DashboardController::class)->name('api.dashboard');
        Route::apiResource('employees', EmployeeController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('/recognitions', [RecognitionController::class, 'store'])->name('api.recognitions.store');
        Route::post('/recognitions/{recognition}/revocations', [RevokedRecognitionController::class, 'store'])->name('api.recognitions.revocations.store');
        Route::post('/occasions', [OccasionController::class, 'store'])->name('api.occasions.store');
        Route::patch('/occasions/{occasion}', [OccasionController::class, 'update'])->name('api.occasions.update');
        Route::delete('/occasions/{occasion}', [OccasionController::class, 'destroy'])->name('api.occasions.destroy');
        Route::post('/company-values', [CompanyValueController::class, 'store'])->name('api.company-values.store');
        Route::patch('/company-values/{company_value}', [CompanyValueController::class, 'update'])->name('api.company-values.update');
        Route::delete('/company-values/{company_value}', [CompanyValueController::class, 'destroy'])->name('api.company-values.destroy');
    });
});
