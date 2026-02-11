<?php

namespace Database\Factories;

use App\Enums\PortfolioStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Portfolio>
 */
class PortfolioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->applicant(),
            'title' => fake()->sentence(3),
            'status' => PortfolioStatus::Draft,
            'submitted_at' => null,
            'admin_notes' => null,
        ];
    }

    /**
     * Set the portfolio status to submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PortfolioStatus::Submitted,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Set the portfolio status to under review.
     */
    public function underReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PortfolioStatus::UnderReview,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Set the portfolio status to evaluated.
     */
    public function evaluated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PortfolioStatus::Evaluated,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Set the portfolio status to revision requested.
     */
    public function revisionRequested(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PortfolioStatus::RevisionRequested,
            'submitted_at' => now(),
            'admin_notes' => fake()->paragraph(),
        ]);
    }

    /**
     * Set the portfolio status to approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PortfolioStatus::Approved,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Set the portfolio status to rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PortfolioStatus::Rejected,
            'submitted_at' => now(),
        ]);
    }
}
