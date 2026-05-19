<?php

namespace Tests\Feature\Evaluator;

use App\Enums\AssignmentStatus;
use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Enums\RubricCategory;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectEvaluationStatus;
use App\Models\AcademicYear;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioSubject;
use App\Models\RubricCriteria;
use App\Models\Subject;
use App\Models\SubjectEvaluation;
use App\Models\SubjectModule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EvaluationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_evaluator_can_view_assigned_portfolios(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        PortfolioAssignment::factory()->create(['evaluator_id' => $evaluator->id]);

        $response = $this->actingAs($evaluator)->get(route('evaluator.portfolios.index'));

        $response->assertStatus(200);
    }

    public function test_non_evaluator_cannot_view_evaluator_portfolios(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();

        $this->actingAs($admin)->get(route('evaluator.portfolios.index'))->assertStatus(403);
        $this->actingAs($applicant)->get(route('evaluator.portfolios.index'))->assertStatus(403);
    }

    public function test_evaluator_can_view_assignment_details(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $assignment = PortfolioAssignment::factory()->create(['evaluator_id' => $evaluator->id]);

        $response = $this->actingAs($evaluator)->get(route('evaluator.portfolios.show', $assignment));

        $response->assertStatus(200);
    }

    public function test_evaluator_cannot_view_other_evaluators_assignment(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $otherEvaluator = User::factory()->evaluator()->create();
        $assignment = PortfolioAssignment::factory()->create(['evaluator_id' => $otherEvaluator->id]);

        $response = $this->actingAs($evaluator)->get(route('evaluator.portfolios.show', $assignment));

        $response->assertStatus(403);
    }

    public function test_evaluator_can_save_evaluation_draft(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->underReview()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);
        $criteria1 = RubricCriteria::factory()->create(['max_score' => 20]);
        $criteria2 = RubricCriteria::factory()->create(['max_score' => 15]);

        $response = $this->actingAs($evaluator)->post(route('evaluator.portfolios.save', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria1->id, 'score' => 15, 'comments' => 'Good work'],
                ['criteria_id' => $criteria2->id, 'score' => 10, 'comments' => ''],
            ],
            'overall_comments' => 'Promising portfolio.',
            'recommendation' => '',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('evaluations', [
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
            'status' => EvaluationStatus::Draft->value,
        ]);

        $this->assertDatabaseHas('evaluation_scores', [
            'rubric_criteria_id' => $criteria1->id,
            'score' => 15,
        ]);
    }

    public function test_evaluator_can_submit_evaluation(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->underReview()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);
        $criteria = RubricCriteria::factory()->create(['max_score' => 20]);

        $response = $this->actingAs($evaluator)->post(route('evaluator.portfolios.submit', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria->id, 'score' => 18, 'comments' => 'Excellent'],
            ],
            'overall_comments' => 'Highly recommended for approval.',
            'recommendation' => 'approve',
        ]);

        $response->assertRedirect(route('evaluator.portfolios.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('evaluations', [
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
            'status' => EvaluationStatus::Submitted->value,
            'recommendation' => 'approve',
        ]);

        $this->assertDatabaseHas('portfolio_assignments', [
            'id' => $assignment->id,
            'status' => AssignmentStatus::Completed->value,
        ]);

        $portfolio->refresh();
        $this->assertEquals(PortfolioStatus::Approved, $portfolio->status);
    }

    public function test_submit_with_request_revision_sets_revision_requested_status(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->underReview()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);
        $criteria = RubricCriteria::factory()->create(['max_score' => 20]);

        $this->actingAs($evaluator)->post(route('evaluator.portfolios.submit', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria->id, 'score' => 12, 'comments' => 'Needs revisions'],
            ],
            'overall_comments' => 'Please revise and re-submit.',
            'recommendation' => 'request_revision',
        ])->assertRedirect(route('evaluator.portfolios.index'));

        $portfolio->refresh();
        $this->assertEquals(PortfolioStatus::RevisionRequested, $portfolio->status);
    }

    public function test_evaluator_can_assign_subject_after_portfolio_is_approved(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->approved()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);
        $subject = $this->createSubject();

        $response = $this->actingAs($evaluator)->post(route('evaluator.portfolios.subjects.store', $assignment), [
            'subject_id' => $subject->id,
            'notes' => 'For worksite assessment.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('portfolio_subjects', [
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $evaluator->id,
            'status' => SubjectAssignmentStatus::Pending->value,
        ]);
    }

    public function test_evaluator_can_upload_module_for_owned_subject_assignment(): void
    {
        Storage::fake('public');

        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->approved()->create();
        $subject = $this->createSubject();

        $portfolioSubject = PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $evaluator->id,
            'status' => SubjectAssignmentStatus::InProgress,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($evaluator)->post(route('evaluator.subjects.modules.store', $portfolioSubject), [
            'title' => 'Evaluator Module',
            'description' => 'Sample upload',
            'file' => UploadedFile::fake()->create('module.pdf', 256, 'application/pdf'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $module = SubjectModule::query()->where('subject_id', $subject->id)->first();

        $this->assertNotNull($module);
        $this->assertSame($evaluator->id, $module->uploaded_by);
        Storage::disk('public')->assertExists($module->file_path);
    }

    public function test_evaluator_cannot_open_subject_assignment_for_locked_portfolio(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->underReview()->create();
        $subject = $this->createSubject();

        $portfolioSubject = PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $evaluator->id,
            'status' => SubjectAssignmentStatus::Pending,
            'assigned_at' => now(),
        ]);

        $this->actingAs($evaluator)
            ->get(route('evaluator.subjects.show', $portfolioSubject))
            ->assertForbidden();
    }

    public function test_evaluator_cannot_upload_module_for_locked_portfolio_subject_assignment(): void
    {
        Storage::fake('public');

        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->underReview()->create();
        $subject = $this->createSubject();

        $portfolioSubject = PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $evaluator->id,
            'status' => SubjectAssignmentStatus::InProgress,
            'assigned_at' => now(),
        ]);

        $this->actingAs($evaluator)->post(route('evaluator.subjects.modules.store', $portfolioSubject), [
            'title' => 'Blocked Upload',
            'description' => 'Should be blocked for locked portfolio.',
            'file' => UploadedFile::fake()->create('blocked.pdf', 128, 'application/pdf'),
        ])->assertForbidden();

        $this->assertDatabaseCount('subject_modules', 0);
    }

    public function test_submitted_subject_evaluation_defaults_conducted_date_when_not_provided(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->approved()->create();
        $subject = $this->createSubject();

        $portfolioSubject = PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $evaluator->id,
            'status' => SubjectAssignmentStatus::InProgress,
            'assigned_at' => now(),
        ]);

        $criteria = RubricCriteria::factory()->create([
            'category' => RubricCategory::Interview,
            'max_score' => 20,
        ]);

        $response = $this->actingAs($evaluator)->post(route('evaluator.subjects.save', $portfolioSubject), [
            'category' => RubricCategory::Interview->value,
            'attempt_number' => 1,
            'submit' => true,
            'comments' => 'Interview evaluation submitted.',
            'scores' => [
                [
                    'rubric_criteria_id' => $criteria->id,
                    'score' => 15,
                    'comments' => 'Strong practical answers.',
                ],
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $evaluation = SubjectEvaluation::query()
            ->where('portfolio_subject_id', $portfolioSubject->id)
            ->where('category', RubricCategory::Interview->value)
            ->first();

        $this->assertNotNull($evaluation);
        $this->assertEquals(SubjectEvaluationStatus::Submitted, $evaluation->status);
        $this->assertNotNull($evaluation->conducted_at);
        $this->assertNotNull($evaluation->submitted_at);
    }

    public function test_submit_requires_overall_comments_and_recommendation(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $assignment = PortfolioAssignment::factory()->create(['evaluator_id' => $evaluator->id]);
        $criteria = RubricCriteria::factory()->create();

        $response = $this->actingAs($evaluator)->post(route('evaluator.portfolios.submit', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria->id, 'score' => 5, 'comments' => ''],
            ],
            'overall_comments' => '',
            'recommendation' => '',
        ]);

        $response->assertSessionHasErrors(['overall_comments', 'recommendation']);
    }

    public function test_score_is_capped_at_max_score(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->underReview()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);
        $criteria = RubricCriteria::factory()->create(['max_score' => 10]);

        $this->actingAs($evaluator)->post(route('evaluator.portfolios.save', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria->id, 'score' => 50, 'comments' => ''],
            ],
            'overall_comments' => '',
            'recommendation' => '',
        ]);

        $this->assertDatabaseHas('evaluation_scores', [
            'rubric_criteria_id' => $criteria->id,
            'score' => 10,
        ]);
    }

    public function test_saving_evaluation_sets_assignment_to_in_progress(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'evaluator_id' => $evaluator->id,
            'status' => AssignmentStatus::Pending,
        ]);
        $criteria = RubricCriteria::factory()->create();

        $this->actingAs($evaluator)->post(route('evaluator.portfolios.save', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria->id, 'score' => 5, 'comments' => ''],
            ],
            'overall_comments' => '',
            'recommendation' => '',
        ]);

        $this->assertDatabaseHas('portfolio_assignments', [
            'id' => $assignment->id,
            'status' => AssignmentStatus::InProgress->value,
        ]);
    }

    public function test_evaluator_cannot_save_evaluation_for_other_assignment(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $otherEvaluator = User::factory()->evaluator()->create();
        $assignment = PortfolioAssignment::factory()->create(['evaluator_id' => $otherEvaluator->id]);
        $criteria = RubricCriteria::factory()->create();

        $response = $this->actingAs($evaluator)->post(route('evaluator.portfolios.save', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria->id, 'score' => 5, 'comments' => ''],
            ],
        ]);

        $response->assertStatus(403);
    }

    private function createSubject(): Subject
    {
        $year = AcademicYear::create([
            'name' => 'AY 2026-2027',
            'start_date' => now()->startOfYear()->toDateString(),
            'end_date' => now()->endOfYear()->toDateString(),
            'is_active' => true,
        ]);

        return Subject::create([
            'academic_year_id' => $year->id,
            'code' => 'CS101',
            'name' => 'Introduction to Computing',
            'description' => 'Core subject',
            'units' => 3,
            'is_active' => true,
        ]);
    }
}
