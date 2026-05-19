<?php

namespace Tests\Feature\Applicant;

use App\Enums\PortfolioStatus;
use App\Enums\RubricCategory;
use App\Enums\SubjectEvaluationStatus;
use App\Models\AcademicYear;
use App\Models\Portfolio;
use App\Models\PortfolioSubject;
use App\Models\PreAssessmentAttempt;
use App\Models\Subject;
use App\Models\SubjectEvaluation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradesMetadataTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_grades_page_includes_evaluator_metadata_per_assessment(): void
    {
        $data = $this->createAssessmentScenario();

        $response = $this->actingAs($data['applicant'])->get(route('applicant.grades.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/grades/index')
                ->has('rows', 1)
                ->where('rows.0.pre_assessment.evaluator_name', $data['preAssessmentEvaluator']->name)
                ->where('rows.0.pre_assessment.academic_year', 'AY 2026-2027')
                ->where('rows.0.pre_assessment.program', 'BSIT')
                ->where('rows.0.pre_assessment.evaluation_date', fn ($value) => is_string($value) && $value !== '')
                ->where('rows.0.interview.evaluator_name', $data['subjectEvaluator']->name)
                ->where('rows.0.interview.academic_year', 'AY 2026-2027')
                ->where('rows.0.interview.program', 'BSIT')
                ->where('rows.0.interview.evaluation_date', fn ($value) => is_string($value) && $value !== '')
        );
    }

    public function test_subject_detail_payload_includes_assessment_metadata(): void
    {
        $data = $this->createAssessmentScenario();

        $response = $this->actingAs($data['applicant'])
            ->get(route('applicant.subjects.show', $data['portfolioSubject']));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/subjects/show')
                ->where('portfolioSubject.subject.academic_year.name', 'AY 2026-2027')
                ->where('portfolioSubject.pre_assessment_attempts.0.grader.name', $data['preAssessmentEvaluator']->name)
                ->where('portfolioSubject.pre_assessment_attempts.0.graded_at', fn ($value) => is_string($value) && $value !== '')
                ->where('portfolioSubject.subject_evaluations.0.evaluator.name', $data['subjectEvaluator']->name)
                ->where('portfolioSubject.subject_evaluations.0.conducted_at', fn ($value) => is_string($value) && $value !== '')
        );
    }

    /**
     * @return array{applicant: User, portfolioSubject: PortfolioSubject, preAssessmentEvaluator: User, subjectEvaluator: User}
     */
    private function createAssessmentScenario(): array
    {
        $applicant = User::factory()->applicant()->create();
        $preAssessmentEvaluator = User::factory()->evaluator()->create(['name' => 'Pre Assessment Evaluator']);
        $subjectEvaluator = User::factory()->evaluator()->create(['name' => 'Subject Evaluator']);

        $year = AcademicYear::create([
            'name' => 'AY 2026-2027',
            'start_date' => now()->startOfYear()->toDateString(),
            'end_date' => now()->endOfYear()->toDateString(),
            'is_active' => true,
        ]);

        $subject = Subject::create([
            'academic_year_id' => $year->id,
            'code' => 'BSIT-401',
            'name' => 'Systems Integration',
            'description' => 'Capstone-aligned integration subject',
            'units' => 3,
            'is_active' => true,
        ]);

        $portfolio = Portfolio::factory()->create([
            'user_id' => $applicant->id,
            'status' => PortfolioStatus::Approved,
        ]);

        $portfolioSubject = PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $subjectEvaluator->id,
            'status' => 'in_progress',
            'assigned_at' => now(),
        ]);

        PreAssessmentAttempt::create([
            'portfolio_subject_id' => $portfolioSubject->id,
            'attempt_number' => 1,
            'narrative' => 'Initial submission',
            'submitted_at' => now()->subDays(3),
            'score' => 86,
            'max_score' => 100,
            'graded_by' => $preAssessmentEvaluator->id,
            'graded_at' => now()->subDays(2),
            'grader_comments' => 'Strong baseline understanding',
        ]);

        SubjectEvaluation::create([
            'portfolio_subject_id' => $portfolioSubject->id,
            'evaluator_id' => $subjectEvaluator->id,
            'category' => RubricCategory::Interview,
            'attempt_number' => 1,
            'status' => SubjectEvaluationStatus::Submitted,
            'score' => 18,
            'max_score' => 20,
            'comments' => 'Clear and complete responses',
            'conducted_at' => now()->subDay(),
            'submitted_at' => now()->subDay(),
        ]);

        return [
            'applicant' => $applicant,
            'portfolioSubject' => $portfolioSubject,
            'preAssessmentEvaluator' => $preAssessmentEvaluator,
            'subjectEvaluator' => $subjectEvaluator,
        ];
    }
}
