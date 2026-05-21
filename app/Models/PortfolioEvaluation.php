<?php

namespace App\Models;

use App\Enums\RubricCategory;
use App\Enums\SubjectEvaluationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PortfolioEvaluation extends Model
{
    protected $fillable = [
        'portfolio_id',
        'evaluator_id',
        'category',
        'attempt_number',
        'status',
        'score',
        'max_score',
        'comments',
        'conducted_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'category' => RubricCategory::class,
            'status' => SubjectEvaluationStatus::class,
            'score' => 'decimal:2',
            'max_score' => 'decimal:2',
            'conducted_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(PortfolioEvaluationScore::class);
    }

    public function calculateTotalScore(): void
    {
        $this->score = $this->scores()->sum('score');
        $this->max_score = $this->scores()
            ->join('rubric_criterias', 'portfolio_evaluation_scores.rubric_criteria_id', '=', 'rubric_criterias.id')
            ->sum('rubric_criterias.max_score');
        $this->save();
    }
}
