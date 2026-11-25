<?php

use App\Http\Controllers\Api\V1\AdminAnalyticsController;
use App\Http\Controllers\Api\V1\AdminRewardController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthenticatedSessionController;
use App\Http\Controllers\Api\V1\CatalogueController;
use App\Http\Controllers\Api\V1\CompanyValueController;
use App\Http\Controllers\Api\V1\ConnectivityController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\MessageSuggestionController;
use App\Http\Controllers\Api\V1\OccasionController;
use App\Http\Controllers\Api\V1\RecognitionController;
use App\Http\Controllers\Api\V1\RedemptionController;
use App\Http\Controllers\Api\V1\RedemptionHistoryController;
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
        Route::get('/catalogue', CatalogueController::class)->name('api.catalogue.index');
        Route::get('/admin/merchants', [AdminRewardController::class, 'merchants'])->name('api.admin.merchants.index');
        Route::post('/admin/rewards', [AdminRewardController::class, 'store'])->name('api.admin.rewards.store');
        Route::post('/redemptions', [RedemptionController::class, 'store'])->name('api.redemptions.store');
        Route::get('/redemptions', RedemptionHistoryController::class)->name('api.redemptions.index');
        Route::post('/message-suggestions', MessageSuggestionController::class)->middleware('throttle:10,1')->name('api.message-suggestions.store');
        Route::apiResource('employees', EmployeeController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('/recognitions', [RecognitionController::class, 'index'])->name('api.recognitions.index');
        Route::post('/recognitions', [RecognitionController::class, 'store'])->name('api.recognitions.store');
        Route::post('/recognitions/{recognition}/revocations', [RevokedRecognitionController::class, 'store'])->name('api.recognitions.revocations.store');
        Route::post('/occasions', [OccasionController::class, 'store'])->name('api.occasions.store');
        Route::patch('/occasions/{occasion}', [OccasionController::class, 'update'])->name('api.occasions.update');
        Route::delete('/occasions/{occasion}', [OccasionController::class, 'destroy'])->name('api.occasions.destroy');
        Route::post('/company-values', [CompanyValueController::class, 'store'])->name('api.company-values.store');
        Route::patch('/company-values/{company_value}', [CompanyValueController::class, 'update'])->name('api.company-values.update');
        Route::delete('/company-values/{company_value}', [CompanyValueController::class, 'destroy'])->name('api.company-values.destroy');

        // Analytics & CSV Exports
        Route::get('/analytics/employee', [AnalyticsController::class, 'employee'])->name('api.analytics.employee');
        Route::get('/analytics/personal-export', [AnalyticsController::class, 'personalExport'])->name('api.analytics.personal-export');
        Route::get('/analytics/admin/summary', [AdminAnalyticsController::class, 'summary'])->name('api.analytics.admin.summary');
        Route::get('/analytics/admin/system-export', [AdminAnalyticsController::class, 'systemExport'])->name('api.analytics.admin.system-export');
    });
});
