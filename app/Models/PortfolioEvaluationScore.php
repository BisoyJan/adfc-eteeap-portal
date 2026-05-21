<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioEvaluationScore extends Model
{
    protected $fillable = [
        'portfolio_evaluation_id',
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

    public function portfolioEvaluation(): BelongsTo
    {
        return $this->belongsTo(PortfolioEvaluation::class);
    }

    public function criteria(): BelongsTo
    {
        return $this->belongsTo(RubricCriteria::class, 'rubric_criteria_id');
    }
}
