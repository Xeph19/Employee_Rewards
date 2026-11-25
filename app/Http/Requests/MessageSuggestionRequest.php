<?php

namespace App\Http\Requests;

use App\Models\Recognition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MessageSuggestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Recognition::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'occasion_id' => ['nullable', 'integer', Rule::exists('occasions', 'id')->where('is_active', true)],
            'company_value_ids' => ['nullable', 'array', 'max:5'],
            'company_value_ids.*' => ['integer', 'distinct', Rule::exists('company_values', 'id')->where('is_active', true)],
            'recipient_name' => ['nullable', 'string', 'max:100'],
        ];
    }
}
