<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRedemptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->employee()->where('is_active', true)->exists() ?? false;
    }

    public function rules(): array
    {
        return [
            'reward_id' => ['required', 'integer', Rule::exists('rewards', 'id')],
            'request_key' => ['required', 'string', 'max:100'],
        ];
    }
}
