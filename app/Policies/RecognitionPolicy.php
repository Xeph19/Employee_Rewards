<?php

namespace App\Policies;

use App\Enums\RoleName;
use App\Models\Recognition;
use App\Models\User;

class RecognitionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(RoleName::Admin) || $user->hasRole(RoleName::Manager);
    }

    public function revoke(User $user, Recognition $recognition): bool
    {
        return $recognition->revoked_at === null && $user->hasRole(RoleName::Admin);
    }
}
