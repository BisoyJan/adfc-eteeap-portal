<?php

namespace Tests\Feature\Applicant;

use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Enums\RubricCategory;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectEvaluationStatus;
use App\Models\AcademicYear;
use App\Models\Evaluation;
use App\Models\EvaluationScore;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioEvaluation;
use App\Models\PortfolioSubject;
use App\Models\RubricCriteria;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioEvaluationResultsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_applicant_can_view_evaluation_results_on_evaluated_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->evaluated()->create(['user_id' => $applicant->id]);
        $assignment = PortfolioAssignment::factory()->completed()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);

        $criteria = RubricCriteria::factory()->create(['max_score' => 25]);
        $evaluation = Evaluation::factory()->submitted()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
            'assignment_id' => $assignment->id,
            'overall_comments' => 'Excellent portfolio.',
            'recommendation' => 'approve',
            'total_score' => 20,
            'max_possible_score' => 25,
        ]);
        EvaluationScore::factory()->create([
            'evaluation_id' => $evaluation->id,
            'rubric_criteria_id' => $criteria->id,
            'score' => 20,
            'comments' => 'Well documented.',
        ]);

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/portfolios/show')
                ->has('evaluations', 1)
                ->where('evaluations.0.overall_comments', 'Excellent portfolio.')
                ->where('evaluations.0.recommendation', 'approve')
                ->has('evaluations.0.scores', 1)
        );
    }

    public function test_draft_evaluations_are_not_visible_to_applicant(): void
    {
        $applicant = User::factory()->applicant()->create();
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->create([
            'user_id' => $applicant->id,
            'status' => PortfolioStatus::UnderReview,
        ]);

        Evaluation::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
            'status' => EvaluationStatus::Draft,
        ]);

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/portfolios/show')
                ->has('evaluations', 0)
        );
    }

    public function test_portfolio_show_includes_progress_timeline_data(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->submitted()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/portfolios/show')
                ->where('portfolio.status', 'submitted')
                ->has('evaluations')
        );
    }

    public function test_worksite_visit_ratings_are_visible_on_portfolio_upload_page(): void
    {
        $applicant = User::factory()->applicant()->create();
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->approved()->create(['user_id' => $applicant->id]);

        PortfolioEvaluation::create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
            'category' => RubricCategory::WorksiteVisit,
            'attempt_number' => 1,
            'status' => SubjectEvaluationStatus::Submitted,
            'score' => 18,
            'max_score' => 20,
            'comments' => 'Strong on-site performance.',
            'conducted_at' => now()->subDay(),
            'submitted_at' => now()->subDay(),
        ]);

        PortfolioEvaluation::create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
            'category' => RubricCategory::WorksiteVisit,
            'attempt_number' => 2,
            'status' => SubjectEvaluationStatus::Draft,
            'score' => 0,
            'max_score' => 20,
        ]);

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/portfolios/show')
                ->has('worksiteVisitRatings', 1)
                ->where('worksiteVisitRatings.0.evaluator.name', $evaluator->name)
                ->where('worksiteVisitRatings.0.attempt_number', 1)
        );
    }

    public function test_assigned_subjects_are_visible_on_portfolio_page(): void
    {
        $applicant = User::factory()->applicant()->create();
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->approved()->create(['user_id' => $applicant->id]);

        $year = AcademicYear::create([
            'name' => 'AY 2027-2028',
            'start_date' => now()->startOfYear()->toDateString(),
            'end_date' => now()->endOfYear()->toDateString(),
            'is_active' => true,
        ]);

        $subject = Subject::create([
            'academic_year_id' => $year->id,
            'code' => 'IT401',
            'name' => 'Enterprise Systems',
            'description' => 'Assigned subject sample',
            'units' => 3,
            'is_active' => true,
        ]);

        PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $evaluator->id,
            'status' => SubjectAssignmentStatus::InProgress,
            'notes' => 'Proceed with written exam after pre-assessment.',
            'assigned_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/portfolios/show')
                ->has('assignedSubjects', 1)
                ->where('assignedSubjects.0.subject.code', 'IT401')
                ->where('assignedSubjects.0.evaluator.name', $evaluator->name)
                ->where('assignedSubjects.0.status', SubjectAssignmentStatus::InProgress->value)
        );
    }

    public function test_other_applicant_cannot_view_evaluation_results(): void
    {
        $applicant1 = User::factory()->applicant()->create();
        $applicant2 = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->evaluated()->create(['user_id' => $applicant1->id]);

        $response = $this->actingAs($applicant2)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(403);
    }
}
