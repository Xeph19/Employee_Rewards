<?php

namespace App\Http\Requests;

use App\Enums\RoleName;
use Illuminate\Foundation\Http\FormRequest;

class StoreRewardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(RoleName::Admin) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'merchant_id' => ['required', 'integer', 'exists:merchants,id'],
            'description' => ['nullable', 'string', 'max:500'],
            'points_cost' => ['required', 'integer', 'min:1'],
            'stock_quantity' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
