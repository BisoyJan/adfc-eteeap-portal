<?php

namespace App\Http\Requests\Applicant;

use App\Models\DocumentCategory;
use Illuminate\Foundation\Http\FormRequest;

class SubmitPortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $portfolio = $this->route('portfolio');

        return $this->user()->can('submit-portfolios')
            && $portfolio->user_id === $this->user()->id
            && $portfolio->canBeSubmitted();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $portfolio = $this->route('portfolio');

            $requiredCategories = DocumentCategory::where('is_required', true)->pluck('id');

            $uploadedCategories = $portfolio->documents()
                ->whereIn('document_category_id', $requiredCategories)
                ->distinct()
                ->pluck('document_category_id');

            $missingCategories = $requiredCategories->diff($uploadedCategories);

            if ($missingCategories->isNotEmpty()) {
                $missingNames = DocumentCategory::whereIn('id', $missingCategories)
                    ->pluck('name')
                    ->implode(', ');

                $validator->errors()->add(
                    'documents',
                    "Missing required documents: {$missingNames}",
                );
            }
        });
    }
}
