<?php

namespace App\Models;

use App\Enums\EvaluationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluation extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluationFactory> */
    use HasFactory;

    protected $fillable = [
        'portfolio_id',
        'evaluator_id',
        'assignment_id',
        'status',
        'overall_comments',
        'recommendation',
        'total_score',
        'max_possible_score',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => EvaluationStatus::class,
            'total_score' => 'decimal:2',
            'max_possible_score' => 'decimal:2',
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

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(PortfolioAssignment::class, 'assignment_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class);
    }

    public function isDraft(): bool
    {
        return $this->status === EvaluationStatus::Draft;
    }

    public function isSubmitted(): bool
    {
        return $this->status === EvaluationStatus::Submitted;
    }

    /**
     * Calculate and update the total score from evaluation scores.
     */
    public function calculateTotalScore(): void
    {
        $this->total_score = $this->scores()->sum('score');
        $this->max_possible_score = $this->scores()
            ->join('rubric_criterias', 'evaluation_scores.rubric_criteria_id', '=', 'rubric_criterias.id')
            ->sum('rubric_criterias.max_score');
        $this->save();
    }
}
