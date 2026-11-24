<?php

namespace App\Http\Requests;

use App\Models\Occasion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOccasionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage', Occasion::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('occasions')],
            'description' => ['nullable', 'string', 'max:500'],
            'default_points' => ['nullable', 'integer', 'min:1'],
            'company_value_ids' => ['array'],
            'company_value_ids.*' => ['integer', 'distinct', Rule::exists('company_values', 'id')],
        ];
    }
}
