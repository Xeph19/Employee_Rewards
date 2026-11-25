<?php

namespace App\Http\Requests;

use App\Enums\RoleName;
use App\Models\Employee;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $employee = $this->route('employee');

        return $employee instanceof Employee && ($this->user()?->can('update', $employee) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('employee')?->user_id)],
            'employee_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('employees', 'employee_number')->ignore($this->route('employee'))],
            'department' => ['sometimes', 'required', 'string', 'max:100'],
            'job_title' => ['sometimes', 'required', 'string', 'max:100'],
            'manager_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('is_active', true), Rule::notIn([$this->route('employee')?->id])],
            'role' => ['sometimes', 'required', Rule::enum(RoleName::class)],
            'joined_at' => ['nullable', 'date'],
            'birth_date' => ['nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
