<?php

namespace App\Http\Requests;

use App\Enums\RoleName;
use App\Models\Employee;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Employee::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'employee_number' => ['required', 'string', 'max:50', Rule::unique('employees', 'employee_number')],
            'department' => ['required', 'string', 'max:100'],
            'job_title' => ['required', 'string', 'max:100'],
            'manager_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('is_active', true)],
            'role' => ['required', Rule::enum(RoleName::class)],
            'joined_at' => ['nullable', 'date'],
            'birth_date' => ['nullable', 'date'],
        ];
    }
}
