<?php

namespace App\Models;

use App\Enums\PortfolioStatus;
use App\Enums\RubricCategory;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectEvaluationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'status',
        'submitted_at',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => PortfolioStatus::class,
            'submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PortfolioDocument::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(PortfolioAssignment::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function waiverRecommendations(): HasMany
    {
        return $this->hasMany(WaiverRecommendation::class);
    }

    public function portfolioSubjects(): HasMany
    {
        return $this->hasMany(PortfolioSubject::class);
    }

    public function portfolioEvaluations(): HasMany
    {
        return $this->hasMany(PortfolioEvaluation::class);
    }

    public function latestAssignment(): ?PortfolioAssignment
    {
        return $this->assignments()->latest('assigned_at')->first();
    }

    public function isDraft(): bool
    {
        return $this->status === PortfolioStatus::Draft;
    }

    public function isSubmitted(): bool
    {
        return $this->status === PortfolioStatus::Submitted;
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, [
            PortfolioStatus::Draft,
            PortfolioStatus::RevisionRequested,
        ], true);
    }

    public function canUploadToCategory(int $categoryId): bool
    {
        if ($this->canBeEdited()) {
            return true;
        }

        if (in_array($this->status, [PortfolioStatus::Approved, PortfolioStatus::Rejected], true)) {
            return false;
        }

        return ! $this->documents()->where('document_category_id', $categoryId)->exists();
    }

    public function canBeSubmitted(): bool
    {
        return in_array($this->status, [
            PortfolioStatus::Draft,
            PortfolioStatus::RevisionRequested,
        ], true);
    }

    public function canBeDeleted(): bool
    {
        return $this->status === PortfolioStatus::Draft;
    }

    /**
     * Returns true when every subject is completed and the worksite visit
     * portfolio-level evaluation has been submitted.
     */
    public function isFullyEvaluated(): bool
    {
        $subjects = $this->portfolioSubjects()->get(['id', 'status']);

        if ($subjects->isEmpty()) {
            return false;
        }

        if ($subjects->contains(fn ($s) => $s->status !== SubjectAssignmentStatus::Completed)) {
            return false;
        }

        return $this->portfolioEvaluations()
            ->where('category', RubricCategory::WorksiteVisit->value)
            ->where('status', SubjectEvaluationStatus::Submitted->value)
            ->exists();
    }

    /**
     * Automatically transitions the portfolio to Evaluated when all grading
     * conditions are satisfied.  Only acts if status is currently UnderReview.
     */
    public function attemptAutoEvaluate(): void
    {
        if ($this->status === PortfolioStatus::UnderReview && $this->isFullyEvaluated()) {
            $this->update(['status' => PortfolioStatus::Evaluated]);
        }
    }
}
