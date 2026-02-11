<?php

namespace App\Models;

use App\Enums\AssignmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PortfolioAssignment extends Model
{
    /** @use HasFactory<\Database\Factories\PortfolioAssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'portfolio_id',
        'evaluator_id',
        'assigned_by',
        'status',
        'due_date',
        'notes',
        'assigned_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => AssignmentStatus::class,
            'due_date' => 'date',
            'assigned_at' => 'datetime',
            'completed_at' => 'datetime',
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

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function evaluation(): HasOne
    {
        return $this->hasOne(Evaluation::class, 'assignment_id');
    }

    public function isPending(): bool
    {
        return $this->status === AssignmentStatus::Pending;
    }

    public function isInProgress(): bool
    {
        return $this->status === AssignmentStatus::InProgress;
    }

    public function isCompleted(): bool
    {
        return $this->status === AssignmentStatus::Completed;
    }
}
