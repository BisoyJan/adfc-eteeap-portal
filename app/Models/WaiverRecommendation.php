<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaiverRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'portfolio_id',
        'evaluator_id',
        'course_code',
        'course_name',
        'academic_units',
        'rationale',
        'status',
    ];

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function isRecommended(): bool
    {
        return $this->status === 'recommended';
    }
}
