<?php

namespace Database\Factories;

use App\Models\DocumentCategory;
use App\Models\Portfolio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PortfolioDocument>
 */
class PortfolioDocumentFactory extends Factory
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
            'document_category_id' => DocumentCategory::factory(),
            'file_name' => fake()->word().'.pdf',
            'file_path' => 'portfolios/'.fake()->uuid().'.pdf',
            'file_size' => fake()->numberBetween(1024, 10485760),
            'mime_type' => 'application/pdf',
            'notes' => null,
        ];
    }
}
