<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectModule extends Model
{
    protected $fillable = [
        'subject_id',
        'portfolio_subject_id',
        'uploaded_by',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function portfolioSubject(): BelongsTo
    {
        return $this->belongsTo(PortfolioSubject::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
