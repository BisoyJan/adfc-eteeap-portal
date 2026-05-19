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
                'category' => 'portfolio',
                'max_score' => 20,
                'sort_order' => 1,
            ],
            [
                'name' => 'Relevance of Work Experience',
                'description' => 'Assesses the relevance and depth of work experience to the BSIT program.',
                'category' => 'portfolio',
                'max_score' => 25,
                'sort_order' => 2,
            ],
            [
                'name' => 'Quality of Work Samples',
                'description' => 'Evaluates the quality, complexity, and relevance of submitted work samples or portfolio pieces.',
                'category' => 'portfolio',
                'max_score' => 20,
                'sort_order' => 3,
            ],
            [
                'name' => 'Professional Growth & Development',
                'description' => 'Assesses evidence of continuous learning through certifications, training, and professional development.',
                'category' => 'portfolio',
                'max_score' => 15,
                'sort_order' => 4,
            ],
            [
                'name' => 'Statement of Purpose',
                'description' => 'Evaluates clarity, coherence, and motivation expressed in the applicant\'s statement of purpose.',
                'category' => 'portfolio',
                'max_score' => 10,
                'sort_order' => 5,
            ],
            [
                'name' => 'Character References',
                'description' => 'Assesses the strength and credibility of character references provided.',
                'category' => 'portfolio',
                'max_score' => 10,
                'sort_order' => 6,
            ],

            // Pre-Assessment (per-subject self-assessment review)
            [
                'name' => 'Knowledge Coverage',
                'description' => 'Depth and breadth of subject knowledge demonstrated in the applicant\'s pre-assessment answers.',
                'category' => 'pre_assessment',
                'max_score' => 30,
                'sort_order' => 1,
            ],
            [
                'name' => 'Evidence of Application',
                'description' => 'Concrete examples from work experience that demonstrate practical application of the subject.',
                'category' => 'pre_assessment',
                'max_score' => 30,
                'sort_order' => 2,
            ],
            [
                'name' => 'Reflection & Narrative Quality',
                'description' => 'Clarity, coherence, and self-awareness in the narrative self-assessment.',
                'category' => 'pre_assessment',
                'max_score' => 20,
                'sort_order' => 3,
            ],
            [
                'name' => 'Supporting Documentation',
                'description' => 'Strength of documents attached or referenced to back up the self-assessment.',
                'category' => 'pre_assessment',
                'max_score' => 20,
                'sort_order' => 4,
            ],

            // Interview
            [
                'name' => 'Technical Competence (Interview)',
                'description' => 'Demonstrated mastery of subject concepts during the interview.',
                'category' => 'interview',
                'max_score' => 30,
                'sort_order' => 1,
            ],
            [
                'name' => 'Communication Skills',
                'description' => 'Clarity, organization, and professionalism of verbal responses.',
                'category' => 'interview',
                'max_score' => 20,
                'sort_order' => 2,
            ],
            [
                'name' => 'Problem-Solving & Critical Thinking',
                'description' => 'Ability to analyze scenarios and propose sound solutions on the spot.',
                'category' => 'interview',
                'max_score' => 25,
                'sort_order' => 3,
            ],
            [
                'name' => 'Professional Demeanor',
                'description' => 'Professionalism, attitude, and engagement throughout the interview.',
                'category' => 'interview',
                'max_score' => 25,
                'sort_order' => 4,
            ],

            // Worksite Visit
            [
                'name' => 'Work Environment Verification',
                'description' => 'Verification that the work environment matches what was reported in the portfolio.',
                'category' => 'worksite_visit',
                'max_score' => 25,
                'sort_order' => 1,
            ],
            [
                'name' => 'Role & Responsibilities Observed',
                'description' => 'Observation that the applicant performs the role and duties claimed.',
                'category' => 'worksite_visit',
                'max_score' => 30,
                'sort_order' => 2,
            ],
            [
                'name' => 'Supervisor / Colleague Endorsement',
                'description' => 'Direct feedback from supervisors or peers regarding competence.',
                'category' => 'worksite_visit',
                'max_score' => 25,
                'sort_order' => 3,
            ],
            [
                'name' => 'Output & Deliverables Inspected',
                'description' => 'Quality and relevance of actual outputs inspected on site.',
                'category' => 'worksite_visit',
                'max_score' => 20,
                'sort_order' => 4,
            ],

            // Written Exam
            [
                'name' => 'Conceptual Mastery (Written)',
                'description' => 'Accuracy and depth on conceptual / theory items.',
                'category' => 'written_exam',
                'max_score' => 30,
                'sort_order' => 1,
            ],
            [
                'name' => 'Applied Problem Solving',
                'description' => 'Correctness on applied / case-style items requiring multi-step solutions.',
                'category' => 'written_exam',
                'max_score' => 40,
                'sort_order' => 2,
            ],
            [
                'name' => 'Clarity & Organization (Written)',
                'description' => 'Clarity, organization, and presentation of written responses.',
                'category' => 'written_exam',
                'max_score' => 15,
                'sort_order' => 3,
            ],
            [
                'name' => 'Use of Terminology',
                'description' => 'Correct use of subject-specific terminology and conventions.',
                'category' => 'written_exam',
                'max_score' => 15,
                'sort_order' => 4,
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
