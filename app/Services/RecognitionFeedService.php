<?php

namespace App\Services;

use App\Models\Recognition;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RecognitionFeedService
{
    public function paginate(int $pageSize = 5): LengthAwarePaginator
    {
        return Recognition::query()
            ->select(['id', 'public_id', 'recipient_id', 'awarded_by', 'occasion_id', 'message', 'points', 'created_at'])
            ->whereNull('revoked_at')
            ->with([
                'recipient:id,name',
                'awarder:id,name',
                'occasion:id,name',
                'companyValues:id,name,color',
            ])
            ->latest('created_at')
            ->latest('id')
            ->paginate($pageSize);
    }
}
