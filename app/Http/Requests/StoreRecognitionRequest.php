<?php

namespace App\Http\Requests;

use App\Enums\RecognitionType;
use App\Enums\RoleName;
use App\Models\Recognition;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreRecognitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Recognition::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'recipient_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'type' => ['required', Rule::enum(RecognitionType::class)],
            'occasion_id' => ['nullable', 'required_if:type,occasion', Rule::exists('occasions', 'id')->where('is_active', true)],
            'message' => ['required', 'string', 'min:3', 'max:1000'],
            'points' => ['nullable', 'required_without:sgd_amount', 'integer', 'min:1', 'max:1000000'],
            'sgd_amount' => ['nullable', 'required_without:points', 'numeric', 'decimal:0,2', 'min:0.01', 'max:100000'],
            'request_key' => ['required', 'string', 'max:100'],
            'company_value_ids' => ['required', 'array', 'min:1'],
            'company_value_ids.*' => ['integer', 'distinct', Rule::exists('company_values', 'id')->where('is_active', true)],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $user = $this->user();

            if (! $user || $user->hasRole(RoleName::Admin) || $validator->errors()->has('recipient_id')) {
                return;
            }

            $recipient = User::query()->with('employee.manager')->find($this->integer('recipient_id'));

            if ($recipient?->employee?->manager?->user_id !== $user->id) {
                $validator->errors()->add('recipient_id', 'Managers may only recognize their direct reports.');
            }
        }];
    }
}
