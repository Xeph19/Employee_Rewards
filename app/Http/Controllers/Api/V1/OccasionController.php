<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOccasionRequest;
use App\Http\Requests\UpdateOccasionRequest;
use App\Models\Occasion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OccasionController extends Controller
{
    private function clearOccasionsCache(): void
    {
        Cache::forget('occasions:all:v1');
        Cache::forget('occasions:active:v1');
    }

    public function store(StoreOccasionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $occasion = DB::transaction(function () use ($request, $data): Occasion {
            $occasion = Occasion::query()->create($request->safe()->except('company_value_ids'));
            $occasion->companyValues()->sync($data['company_value_ids'] ?? []);

            return $occasion->load('companyValues:id,name,color');
        });

        $this->clearOccasionsCache();

        return response()->json(['data' => $occasion], 201);
    }

    public function update(UpdateOccasionRequest $request, Occasion $occasion): JsonResponse
    {
        $occasion = DB::transaction(function () use ($request, $occasion): Occasion {
            $occasion->update($request->safe()->except('company_value_ids'));

            if (array_key_exists('company_value_ids', $request->validated())) {
                $occasion->companyValues()->sync($request->validated('company_value_ids'));
            }

            return $occasion->load('companyValues:id,name,color');
        });

        $this->clearOccasionsCache();

        return response()->json(['data' => $occasion]);
    }

    public function destroy(UpdateOccasionRequest $request, Occasion $occasion): JsonResponse
    {
        if ($request->boolean('force')) {
            $occasion->companyValues()->detach();
            $occasion->delete();
        } else {
            $occasion->update(['is_active' => false]);
        }

        $this->clearOccasionsCache();

        return response()->json(status: 204);
    }
}
