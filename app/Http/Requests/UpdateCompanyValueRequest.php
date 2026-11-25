<?php

namespace App\Http\Requests;

use App\Models\CompanyValue;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage', CompanyValue::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('company_values')->ignore($this->route('company_value'))],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'default_points' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1000000'],
            'color' => ['sometimes', 'required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
