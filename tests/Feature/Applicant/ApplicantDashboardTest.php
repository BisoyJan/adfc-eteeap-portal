<?php

namespace Tests\Feature\Applicant;

use App\Enums\AssignmentStatus;
use App\Enums\PortfolioStatus;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicantDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_applicant_can_view_dashboard(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->get('/applicant/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('applicant/dashboard')
            ->has('stats')
            ->has('recentNotifications')
            ->has('recentPortfolios')
        );
    }

    public function test_dashboard_shows_correct_stats(): void
    {
        $applicant = User::factory()->applicant()->create();

        Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Draft]);
        Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Draft]);
        Portfolio::factory()->for($applicant, 'user')->submitted()->create();
        Portfolio::factory()->for($applicant, 'user')->underReview()->create();
        Portfolio::factory()->for($applicant, 'user')->approved()->create();

        $response = $this->actingAs($applicant)->get(route('applicant.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('applicant/dashboard')
            ->where('stats.total', 5)
            ->where('stats.draft', 2)
            ->where('stats.submitted', 1)
            ->where('stats.under_review', 1)
            ->where('stats.approved', 1)
        );
    }

    public function test_dashboard_redirects_from_generic_dashboard(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->get('/dashboard');

        $response->assertRedirect('/applicant/dashboard');
    }

    public function test_non_applicant_cannot_view_applicant_dashboard(): void
    {
        $evaluator = User::factory()->evaluator()->create();

        $response = $this->actingAs($evaluator)->get('/applicant/dashboard');

        $response->assertStatus(403);
    }

    public function test_evaluator_can_view_dashboard(): void
    {
        $evaluator = User::factory()->evaluator()->create();

        $response = $this->actingAs($evaluator)->get(route('evaluator.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('evaluator/dashboard'));
    }

    public function test_evaluator_dashboard_shows_correct_stats(): void
    {
        $evaluator = User::factory()->evaluator()->create();

        PortfolioAssignment::factory()->create([
            'evaluator_id' => $evaluator->id,
            'status' => AssignmentStatus::Pending,
        ]);
        PortfolioAssignment::factory()->inProgress()->create([
            'evaluator_id' => $evaluator->id,
        ]);
        PortfolioAssignment::factory()->completed()->create([
            'evaluator_id' => $evaluator->id,
        ]);

        $response = $this->actingAs($evaluator)->get(route('evaluator.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('evaluator/dashboard')
            ->where('stats.total', 3)
            ->where('stats.pending', 1)
            ->where('stats.in_progress', 1)
            ->where('stats.completed', 1)
        );
    }

    public function test_evaluator_redirects_from_generic_dashboard(): void
    {
        $evaluator = User::factory()->evaluator()->create();

        $response = $this->actingAs($evaluator)->get('/dashboard');

        $response->assertRedirect('/evaluator/dashboard');
    }
}
