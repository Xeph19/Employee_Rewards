<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyValueRequest;
use App\Http\Requests\UpdateCompanyValueRequest;
use App\Models\CompanyValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CompanyValueController extends Controller
{
    private function clearCompanyValuesCache(): void
    {
        Cache::forget('company_values:all:v1');
        Cache::forget('company_values:active:v1');
        Cache::forget('occasions:all:v1');
        Cache::forget('occasions:active:v1');
    }

    public function store(StoreCompanyValueRequest $request): JsonResponse
    {
        $value = CompanyValue::query()->create($request->validated());
        $this->clearCompanyValuesCache();

        return response()->json([
            'data' => $value,
        ], 201);
    }

    public function update(UpdateCompanyValueRequest $request, CompanyValue $companyValue): JsonResponse
    {
        $companyValue->update($request->validated());
        $this->clearCompanyValuesCache();

        return response()->json(['data' => $companyValue]);
    }

    public function destroy(UpdateCompanyValueRequest $request, CompanyValue $companyValue): JsonResponse
    {
        if ($request->boolean('force')) {
            if ($companyValue->recognitions()->exists()) {
                return response()->json([
                    'message' => 'Cannot permanently delete a company value used in existing recognitions. Deactivate it instead.',
                ], 422);
            }

            $companyValue->occasions()->detach();
            $companyValue->delete();
        } else {
            $companyValue->update(['is_active' => false]);
        }

        $this->clearCompanyValuesCache();

        return response()->json(status: 204);
    }
}
