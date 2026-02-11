<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationScore extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluationScoreFactory> */
    use HasFactory;

    protected $fillable = [
        'evaluation_id',
        'rubric_criteria_id',
        'score',
        'comments',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
        ];
    }

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class);
    }

    public function criteria(): BelongsTo
    {
        return $this->belongsTo(RubricCriteria::class, 'rubric_criteria_id');
    }
}
