<?php

namespace Database\Factories;

use App\Enums\EvaluationStatus;
use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Evaluation>
 */
class EvaluationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'portfolio_id' => Portfolio::factory(),
            'evaluator_id' => User::factory()->evaluator(),
            'assignment_id' => null,
            'status' => EvaluationStatus::Draft,
            'overall_comments' => null,
            'recommendation' => null,
            'total_score' => null,
            'max_possible_score' => null,
            'submitted_at' => null,
        ];
    }

    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EvaluationStatus::Submitted,
            'overall_comments' => fake()->paragraph(),
            'recommendation' => fake()->randomElement(['approve', 'revise', 'reject']),
            'total_score' => fake()->numberBetween(50, 100),
            'max_possible_score' => 100,
            'submitted_at' => now(),
        ]);
    }
}
