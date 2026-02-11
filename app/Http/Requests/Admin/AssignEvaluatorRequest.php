<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignEvaluatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdministrative();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'evaluator_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', UserRole::Evaluator->value),
            ],
            'due_date' => ['nullable', 'date', 'after:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'evaluator_id.required' => 'Please select an evaluator.',
            'evaluator_id.exists' => 'The selected user is not a valid evaluator.',
            'due_date.after' => 'The due date must be a future date.',
        ];
    }
}
