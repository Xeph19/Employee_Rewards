<?php

namespace App\Http\Requests;

use App\Models\CompanyValue;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage', CompanyValue::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('company_values')],
            'description' => ['nullable', 'string', 'max:500'],
            'color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }
}
