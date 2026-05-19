<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends FormRequest
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
        $id = $this->route('subject')?->id;

        return [
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('subjects', 'code')
                    ->where(fn ($q) => $q->where('academic_year_id', $this->input('academic_year_id')))
                    ->ignore($id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'units' => ['required', 'integer', 'min:1', 'max:12'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
