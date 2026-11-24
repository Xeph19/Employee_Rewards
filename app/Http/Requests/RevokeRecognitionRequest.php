<?php

namespace App\Http\Requests;

use App\Models\Recognition;
use Illuminate\Foundation\Http\FormRequest;

class RevokeRecognitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $recognition = $this->route('recognition');

        return $recognition instanceof Recognition && ($this->user()?->can('revoke', $recognition) ?? false);
    }

    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:5', 'max:255']];
    }
}
