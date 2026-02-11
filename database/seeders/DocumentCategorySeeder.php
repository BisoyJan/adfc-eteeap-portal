<?php

namespace Database\Seeders;

use App\Models\DocumentCategory;
use Illuminate\Database\Seeder;

class DocumentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'CV / Resume',
                'slug' => 'cv-resume',
                'description' => 'An updated curriculum vitae or resume detailing your professional background.',
                'is_required' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Diploma / Degree',
                'slug' => 'diploma-degree',
                'description' => 'Copy of your highest educational attainment diploma or degree certificate.',
                'is_required' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Transcript of Records (TOR)',
                'slug' => 'transcript-of-records',
                'description' => 'Official transcript of records from your previous educational institution.',
                'is_required' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Professional Certifications',
                'slug' => 'professional-certifications',
                'description' => 'Relevant professional certifications (e.g., NC II, PRC, industry certs).',
                'is_required' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'Employment Records / COE',
                'slug' => 'employment-records',
                'description' => 'Certificate of employment, service records, or other proof of work experience.',
                'is_required' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Training Certificates',
                'slug' => 'training-certificates',
                'description' => 'Certificates from seminars, workshops, and training programs attended.',
                'is_required' => false,
                'sort_order' => 6,
            ],
            [
                'name' => 'Work Samples / Portfolio Evidence',
                'slug' => 'work-samples',
                'description' => 'Samples of your work that demonstrate relevant skills and competencies.',
                'is_required' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Character References',
                'slug' => 'character-references',
                'description' => 'Letters of recommendation or character references from employers or colleagues.',
                'is_required' => false,
                'sort_order' => 8,
            ],
            [
                'name' => 'PSA Birth Certificate',
                'slug' => 'psa-birth-certificate',
                'description' => 'PSA-authenticated copy of your birth certificate.',
                'is_required' => true,
                'sort_order' => 9,
            ],
            [
                'name' => '2x2 ID Photos',
                'slug' => 'id-photos',
                'description' => 'Recent 2x2 ID photos with white background.',
                'is_required' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'Statement of Purpose',
                'slug' => 'statement-of-purpose',
                'description' => 'A written statement explaining your motivation for pursuing the BSIT degree through ETEEAP.',
                'is_required' => true,
                'sort_order' => 11,
            ],
        ];

        foreach ($categories as $category) {
            DocumentCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}
