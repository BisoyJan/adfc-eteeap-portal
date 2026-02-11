<?php

namespace App\Http\Requests\Admin;

use App\Enums\PortfolioStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePortfolioStatusRequest extends FormRequest
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
            'status' => [
                'required',
                'string',
                Rule::in([
                    PortfolioStatus::UnderReview->value,
                    PortfolioStatus::RevisionRequested->value,
                    PortfolioStatus::Approved->value,
                    PortfolioStatus::Rejected->value,
                ]),
            ],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Please select a status.',
            'status.in' => 'The selected status is not valid.',
        ];
    }
}
