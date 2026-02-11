<?php

namespace Tests\Feature\Evaluator;

use App\Enums\AssignmentStatus;
use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\RubricCriteria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        $this->assertEquals(PortfolioStatus::Evaluated, $portfolio->status);
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
}
