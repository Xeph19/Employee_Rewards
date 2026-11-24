<?php

namespace App\Facades;

use App\Services\RewardsService;
use Illuminate\Support\Facades\Facade;

class Rewards extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return RewardsService::class;
    }
}
