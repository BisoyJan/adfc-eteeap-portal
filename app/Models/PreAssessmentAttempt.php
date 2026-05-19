<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PreAssessmentAttempt extends Model
{
    protected $fillable = [
        'portfolio_subject_id',
        'attempt_number',
        'narrative',
        'submitted_at',
        'score',
        'max_score',
        'graded_by',
        'graded_at',
        'grader_comments',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'graded_at' => 'datetime',
            'score' => 'decimal:2',
            'max_score' => 'decimal:2',
        ];
    }

    public function portfolioSubject(): BelongsTo
    {
        return $this->belongsTo(PortfolioSubject::class);
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(PreAssessmentAnswer::class, 'attempt_id');
    }

    public function isSubmitted(): bool
    {
        return $this->submitted_at !== null;
    }

    public function isGraded(): bool
    {
        return $this->graded_at !== null;
    }
}
