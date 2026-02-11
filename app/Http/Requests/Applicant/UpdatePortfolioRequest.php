<?php

namespace App\Http\Requests\Applicant;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $portfolio = $this->route('portfolio');

        return $this->user()->can('submit-portfolios')
            && $portfolio->user_id === $this->user()->id
            && $portfolio->canBeEdited();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
        ];
    }
}
