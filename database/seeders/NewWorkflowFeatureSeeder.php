<?php

namespace Database\Seeders;

use App\Enums\AssignmentStatus;
use App\Enums\PortfolioStatus;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\UserRole;
use App\Models\AcademicYear;
use App\Models\DocumentCategory;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioDocument;
use App\Models\PortfolioSubject;
use App\Models\Subject;
use App\Models\SubjectModule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class NewWorkflowFeatureSeeder extends Seeder
{
    public function run(): void
    {
        if (DocumentCategory::query()->count() === 0) {
            $this->call(DocumentCategorySeeder::class);
        }

        if (AcademicYear::query()->count() === 0 || Subject::query()->count() === 0) {
            $this->call(AcademicYearSubjectSeeder::class);
        }

        $admin = $this->upsertUser([
            'email' => 'feature.admin@adfc.edu.ph',
            'name' => 'Feature Admin',
        ], UserRole::Admin);

        $evaluator = $this->upsertUser([
            'email' => 'feature.evaluator@adfc.edu.ph',
            'name' => 'Feature Evaluator',
        ], UserRole::Evaluator);

        $firstTimeApplicant = $this->upsertUser([
            'email' => 'feature.firsttime.applicant@adfc.edu.ph',
            'name' => 'Feature First-Time Applicant',
            'current_position' => 'Junior IT Specialist',
            'years_it_experience' => 2,
            'company' => 'Feature Labs Inc.',
            'highest_education' => 'Associate Degree in Information Technology',
        ], UserRole::Applicant);

        $firstTimeApplicant->portfolios()->delete();

        $activeApplicant = $this->upsertUser([
            'email' => 'feature.active.applicant@adfc.edu.ph',
            'name' => 'Feature Active Applicant',
            'current_position' => 'Systems Support Engineer',
            'years_it_experience' => 5,
            'company' => 'CoreTech Solutions',
            'highest_education' => 'BS in Computer Science',
        ], UserRole::Applicant);

        $requiredCategories = DocumentCategory::query()
            ->where('is_required', true)
            ->orderBy('sort_order')
            ->take(4)
            ->get();

        $activeInterviewPortfolio = Portfolio::query()->updateOrCreate(
            [
                'user_id' => $activeApplicant->id,
                'title' => 'Feature Active Applicant - Interview Phase',
            ],
            [
                'status' => PortfolioStatus::UnderReview,
                'submitted_at' => now()->subDays(2),
                'admin_notes' => 'Assigned for evaluator interview and document verification.',
            ],
        );

        $this->syncDocuments($activeInterviewPortfolio, $requiredCategories, 'feature-active');

        PortfolioAssignment::query()->updateOrCreate(
            [
                'portfolio_id' => $activeInterviewPortfolio->id,
                'evaluator_id' => $evaluator->id,
            ],
            [
                'assigned_by' => $admin->id,
                'status' => AssignmentStatus::InProgress,
                'due_date' => now()->addDays(10)->toDateString(),
                'notes' => 'Use this assignment to test evaluator interview and decision flow.',
                'assigned_at' => now()->subDay(),
                'completed_at' => null,
            ],
        );

        $approvedApplicant = $this->upsertUser([
            'email' => 'feature.approved.applicant@adfc.edu.ph',
            'name' => 'Feature Approved Applicant',
            'current_position' => 'Network Administrator',
            'years_it_experience' => 7,
            'company' => 'InfraNet Services',
            'highest_education' => 'Diploma in Network Technology',
        ], UserRole::Applicant);

        $approvedPortfolio = Portfolio::query()->updateOrCreate(
            [
                'user_id' => $approvedApplicant->id,
                'title' => 'Feature Approved Applicant - Post Interview',
            ],
            [
                'status' => PortfolioStatus::Approved,
                'submitted_at' => now()->subDays(20),
                'admin_notes' => 'Interview passed. Evaluator can assign subjects and upload modules.',
            ],
        );

        $this->syncDocuments($approvedPortfolio, $requiredCategories, 'feature-approved');

        PortfolioAssignment::query()->updateOrCreate(
            [
                'portfolio_id' => $approvedPortfolio->id,
                'evaluator_id' => $evaluator->id,
            ],
            [
                'assigned_by' => $admin->id,
                'status' => AssignmentStatus::Completed,
                'due_date' => now()->subDays(4)->toDateString(),
                'notes' => 'Interview completed with approval outcome.',
                'assigned_at' => now()->subDays(12),
                'completed_at' => now()->subDays(5),
            ],
        );

        $subjects = Subject::query()->active()->orderBy('code')->take(2)->get();

        foreach ($subjects as $subject) {
            PortfolioSubject::query()->updateOrCreate(
                [
                    'portfolio_id' => $approvedPortfolio->id,
                    'subject_id' => $subject->id,
                ],
                [
                    'evaluator_id' => $evaluator->id,
                    'assigned_by' => $evaluator->id,
                    'status' => SubjectAssignmentStatus::InProgress,
                    'notes' => 'Evaluator-owned subject assignment for worksite/written assessment testing.',
                    'assigned_at' => now()->subDays(3),
                    'completed_at' => null,
                ],
            );

            SubjectModule::query()->updateOrCreate(
                [
                    'subject_id' => $subject->id,
                    'uploaded_by' => $evaluator->id,
                    'title' => 'Feature Module - '.$subject->code,
                ],
                [
                    'description' => 'Sample evaluator-uploaded module for read-only admin and evaluator download testing.',
                    'file_path' => 'subjects/'.$subject->id.'/modules/feature-module-'.$subject->code.'.pdf',
                    'file_name' => 'feature-module-'.$subject->code.'.pdf',
                    'file_size' => 1048576,
                    'mime_type' => 'application/pdf',
                ],
            );
        }

        $rejectedApplicant = $this->upsertUser([
            'email' => 'feature.rejected.applicant@adfc.edu.ph',
            'name' => 'Feature Rejected Applicant',
            'current_position' => 'IT Assistant',
            'years_it_experience' => 3,
            'company' => 'ACME Services',
            'highest_education' => 'Technical-Vocational ICT Track',
        ], UserRole::Applicant);

        Portfolio::query()->updateOrCreate(
            [
                'user_id' => $rejectedApplicant->id,
                'title' => 'Feature Rejected Applicant - Previous Submission',
            ],
            [
                'status' => PortfolioStatus::Rejected,
                'submitted_at' => now()->subDays(30),
                'admin_notes' => 'Rejected record kept to test re-apply eligibility.',
            ],
        );

        $this->command?->info('NewWorkflowFeatureSeeder: seeded role-based workflow scenarios (first-time applicant, evaluator, admin).');
    }

    private function upsertUser(array $attributes, UserRole $role): User
    {
        return User::query()->updateOrCreate(
            ['email' => $attributes['email']],
            [
                'name' => $attributes['name'],
                'password' => 'password',
                'role' => $role,
                'is_active' => true,
                'email_verified_at' => now(),
                'current_position' => $attributes['current_position'] ?? null,
                'years_it_experience' => $attributes['years_it_experience'] ?? null,
                'company' => $attributes['company'] ?? null,
                'highest_education' => $attributes['highest_education'] ?? null,
            ],
        );
    }

    private function syncDocuments(Portfolio $portfolio, Collection $categories, string $prefix): void
    {
        foreach ($categories as $category) {
            PortfolioDocument::query()->updateOrCreate(
                [
                    'portfolio_id' => $portfolio->id,
                    'document_category_id' => $category->id,
                ],
                [
                    'file_name' => $prefix.'-'.$category->slug.'.pdf',
                    'file_path' => 'portfolios/'.$portfolio->id.'/'.$prefix.'-'.$category->slug.'.pdf',
                    'file_size' => 786432,
                    'mime_type' => 'application/pdf',
                    'notes' => null,
                ],
            );
        }
    }
}
