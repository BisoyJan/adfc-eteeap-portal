<?php

namespace Database\Factories;

use App\Enums\AssignmentStatus;
use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PortfolioAssignment>
 */
class PortfolioAssignmentFactory extends Factory
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
            'assigned_by' => User::factory()->admin(),
            'status' => AssignmentStatus::Pending,
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'notes' => fake()->optional()->sentence(),
            'assigned_at' => now(),
            'completed_at' => null,
        ];
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AssignmentStatus::InProgress,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AssignmentStatus::Completed,
            'completed_at' => now(),
        ]);
    }
}
