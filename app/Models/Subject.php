<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'code',
        'name',
        'description',
        'units',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'units' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(SubjectModule::class);
    }

    public function preAssessmentQuestions(): HasMany
    {
        return $this->hasMany(PreAssessmentQuestion::class);
    }

    public function portfolioSubjects(): HasMany
    {
        return $this->hasMany(PortfolioSubject::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
