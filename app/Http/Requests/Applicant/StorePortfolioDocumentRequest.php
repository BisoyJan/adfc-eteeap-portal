<?php

namespace App\Http\Requests\Applicant;

use Illuminate\Foundation\Http\FormRequest;

class StorePortfolioDocumentRequest extends FormRequest
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
            'document_category_id' => ['required', 'exists:document_categories,id'],
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.max' => 'The file must not be larger than 10MB.',
            'file.mimes' => 'The file must be a PDF, DOC, DOCX, JPG, or PNG.',
        ];
    }
}
