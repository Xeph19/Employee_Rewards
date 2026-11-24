<?php

namespace App\Http\Requests;

use App\Models\Occasion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOccasionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage', Occasion::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('occasions')->ignore($this->route('occasion'))],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'default_points' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'company_value_ids' => ['sometimes', 'array'],
            'company_value_ids.*' => ['integer', 'distinct', Rule::exists('company_values', 'id')->where('is_active', true)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
