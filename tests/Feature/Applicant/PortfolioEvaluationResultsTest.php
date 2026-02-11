<?php

namespace Tests\Feature\Applicant;

use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Models\Evaluation;
use App\Models\EvaluationScore;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\RubricCriteria;
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

    public function test_other_applicant_cannot_view_evaluation_results(): void
    {
        $applicant1 = User::factory()->applicant()->create();
        $applicant2 = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->evaluated()->create(['user_id' => $applicant1->id]);

        $response = $this->actingAs($applicant2)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(403);
    }
}
