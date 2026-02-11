<?php

namespace Database\Seeders;

use App\Models\RubricCriteria;
use Illuminate\Database\Seeder;

class RubricCriteriaSeeder extends Seeder
{
    /**
     * Seed default ETEEAP evaluation rubric criteria.
     */
    public function run(): void
    {
        $criteria = [
            [
                'name' => 'Completeness of Documentation',
                'description' => 'Evaluates whether all required documents are present and properly organized.',
                'max_score' => 20,
                'sort_order' => 1,
            ],
            [
                'name' => 'Relevance of Work Experience',
                'description' => 'Assesses the relevance and depth of work experience to the BSIT program.',
                'max_score' => 25,
                'sort_order' => 2,
            ],
            [
                'name' => 'Quality of Work Samples',
                'description' => 'Evaluates the quality, complexity, and relevance of submitted work samples or portfolio pieces.',
                'max_score' => 20,
                'sort_order' => 3,
            ],
            [
                'name' => 'Professional Growth & Development',
                'description' => 'Assesses evidence of continuous learning through certifications, training, and professional development.',
                'max_score' => 15,
                'sort_order' => 4,
            ],
            [
                'name' => 'Statement of Purpose',
                'description' => 'Evaluates clarity, coherence, and motivation expressed in the applicant\'s statement of purpose.',
                'max_score' => 10,
                'sort_order' => 5,
            ],
            [
                'name' => 'Character References',
                'description' => 'Assesses the strength and credibility of character references provided.',
                'max_score' => 10,
                'sort_order' => 6,
            ],
        ];

        foreach ($criteria as $criterion) {
            RubricCriteria::updateOrCreate(
                ['name' => $criterion['name']],
                $criterion,
            );
        }
    }
}
