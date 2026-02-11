<?php

namespace Database\Factories;

use App\Models\Evaluation;
use App\Models\RubricCriteria;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EvaluationScore>
 */
class EvaluationScoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'evaluation_id' => Evaluation::factory(),
            'rubric_criteria_id' => RubricCriteria::factory(),
            'score' => fake()->numberBetween(1, 10),
            'comments' => fake()->optional()->sentence(),
        ];
    }
}
