<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreAssessmentAnswer extends Model
{
    protected $fillable = [
        'attempt_id',
        'question_id',
        'answer',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(PreAssessmentAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(PreAssessmentQuestion::class, 'question_id');
    }
}
