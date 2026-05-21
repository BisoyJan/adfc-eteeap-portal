<?php

namespace App\Models;

use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectRecommendation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PortfolioSubject extends Model
{
    protected $fillable = [
        'portfolio_id',
        'subject_id',
        'evaluator_id',
        'assigned_by',
        'status',
        'recommendation',
        'notes',
        'assigned_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => SubjectAssignmentStatus::class,
            'recommendation' => SubjectRecommendation::class,
            'assigned_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function preAssessmentAttempts(): HasMany
    {
        return $this->hasMany(PreAssessmentAttempt::class);
    }

    public function subjectEvaluations(): HasMany
    {
        return $this->hasMany(SubjectEvaluation::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(SubjectModule::class);
    }
}
