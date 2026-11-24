<?php

namespace App\Services;

use App\Actions\Rewards\AwardRecognition;
use App\Actions\Rewards\RevokeRecognition;
use App\Enums\RecognitionType;
use App\Models\Recognition;
use App\Models\User;

class RewardsService
{
    public function __construct(
        private AwardRecognition $awardRecognition,
        private RevokeRecognition $revokeRecognition,
    ) {}

    /** @param list<int> $companyValueIds */
    public function award(User $recipient, User $awarder, RecognitionType $type, string $message, string $requestKey, array $companyValueIds, ?int $occasionId = null, ?int $points = null, ?string $sgdAmount = null): Recognition
    {
        return $this->awardRecognition->handle($recipient, $awarder, $type, $message, $requestKey, $companyValueIds, $occasionId, $points, $sgdAmount);
    }

    public function revoke(Recognition $recognition, User $revokedBy, string $reason): Recognition
    {
        return $this->revokeRecognition->handle($recognition, $revokedBy, $reason);
    }
}
