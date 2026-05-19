<?php

namespace App\Models;

use App\Enums\RubricCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RubricCriteria extends Model
{
    /** @use HasFactory<\Database\Factories\RubricCriteriaFactory> */
    use HasFactory;

    protected $table = 'rubric_criterias';

    protected $fillable = [
        'name',
        'description',
        'category',
        'max_score',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'category' => RubricCategory::class,
            'max_score' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeOfCategory($query, RubricCategory|string $category)
    {
        $value = $category instanceof RubricCategory ? $category->value : $category;

        return $query->where('category', $value);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class);
    }

    /**
     * Scope to only active criteria.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
