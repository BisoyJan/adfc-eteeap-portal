<?php

namespace App\Models;

use App\Enums\PortfolioStatus;
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
}
