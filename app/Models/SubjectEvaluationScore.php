<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectEvaluationScore extends Model
{
    protected $fillable = [
        'subject_evaluation_id',
        'rubric_criteria_id',
        'score',
        'comments',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
        ];
    }

    public function subjectEvaluation(): BelongsTo
    {
        return $this->belongsTo(SubjectEvaluation::class);
    }

    public function criteria(): BelongsTo
    {
        return $this->belongsTo(RubricCriteria::class, 'rubric_criteria_id');
    }
}
