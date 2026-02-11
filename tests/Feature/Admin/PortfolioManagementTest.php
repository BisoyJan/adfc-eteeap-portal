<?php

namespace Tests\Feature\Admin;

use App\Enums\AssignmentStatus;
use App\Enums\PortfolioStatus;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_can_view_portfolios_list(): void
    {
        $admin = User::factory()->admin()->create();
        Portfolio::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.portfolios.index'));

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_view_portfolios_list(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $applicant = User::factory()->applicant()->create();

        $this->actingAs($evaluator)->get(route('admin.portfolios.index'))->assertStatus(403);
        $this->actingAs($applicant)->get(route('admin.portfolios.index'))->assertStatus(403);
    }

    public function test_admin_can_filter_portfolios_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        Portfolio::factory()->submitted()->count(2)->create();
        Portfolio::factory()->count(1)->create(); // draft

        $response = $this->actingAs($admin)->get(route('admin.portfolios.index', ['status' => 'submitted']));

        $response->assertStatus(200);
    }

    public function test_admin_can_search_portfolios(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create(['name' => 'John Doe']);
        Portfolio::factory()->for($applicant)->create(['title' => 'My BSIT Portfolio']);

        $response = $this->actingAs($admin)->get(route('admin.portfolios.index', ['search' => 'John']));

        $response->assertStatus(200);
    }

    public function test_admin_can_view_portfolio_details(): void
    {
        $admin = User::factory()->admin()->create();
        $portfolio = Portfolio::factory()->submitted()->create();

        $response = $this->actingAs($admin)->get(route('admin.portfolios.show', $portfolio));

        $response->assertStatus(200);
    }

    public function test_admin_can_assign_evaluator(): void
    {
        $admin = User::factory()->admin()->create();
        $evaluator = User::factory()->evaluator()->create();
        $portfolio = Portfolio::factory()->submitted()->create();

        $response = $this->actingAs($admin)->post(route('admin.portfolios.assign', $portfolio), [
            'evaluator_id' => $evaluator->id,
            'due_date' => now()->addDays(14)->toDateString(),
            'notes' => 'Please review thoroughly.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('portfolio_assignments', [
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $admin->id,
            'status' => AssignmentStatus::Pending->value,
        ]);

        $this->assertDatabaseHas('portfolios', [
            'id' => $portfolio->id,
            'status' => PortfolioStatus::UnderReview->value,
        ]);
    }

    public function test_admin_cannot_assign_non_evaluator(): void
    {
        $admin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();
        $portfolio = Portfolio::factory()->submitted()->create();

        $response = $this->actingAs($admin)->post(route('admin.portfolios.assign', $portfolio), [
            'evaluator_id' => $otherAdmin->id,
        ]);

        $response->assertSessionHasErrors('evaluator_id');
    }

    public function test_admin_can_update_portfolio_status(): void
    {
        $admin = User::factory()->admin()->create();
        $portfolio = Portfolio::factory()->underReview()->create();

        $response = $this->actingAs($admin)->put(route('admin.portfolios.status', $portfolio), [
            'status' => 'approved',
            'admin_notes' => 'All documents verified.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('portfolios', [
            'id' => $portfolio->id,
            'status' => PortfolioStatus::Approved->value,
            'admin_notes' => 'All documents verified.',
        ]);
    }

    public function test_admin_can_request_revision_with_notes(): void
    {
        $admin = User::factory()->admin()->create();
        $portfolio = Portfolio::factory()->underReview()->create();

        $response = $this->actingAs($admin)->put(route('admin.portfolios.status', $portfolio), [
            'status' => 'revision_requested',
            'admin_notes' => 'Missing employment certificate.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('portfolios', [
            'id' => $portfolio->id,
            'status' => PortfolioStatus::RevisionRequested->value,
            'admin_notes' => 'Missing employment certificate.',
        ]);
    }

    public function test_admin_cannot_set_invalid_status(): void
    {
        $admin = User::factory()->admin()->create();
        $portfolio = Portfolio::factory()->submitted()->create();

        $response = $this->actingAs($admin)->put(route('admin.portfolios.status', $portfolio), [
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors('status');
    }

    public function test_admin_can_remove_assignment(): void
    {
        $admin = User::factory()->admin()->create();
        $portfolio = Portfolio::factory()->underReview()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
        ]);

        $response = $this->actingAs($admin)->delete(
            route('admin.portfolios.assignments.destroy', [$portfolio, $assignment])
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('portfolio_assignments', [
            'id' => $assignment->id,
        ]);
    }

    public function test_super_admin_can_manage_portfolios(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $portfolio = Portfolio::factory()->submitted()->create();

        $this->actingAs($superAdmin)->get(route('admin.portfolios.index'))->assertStatus(200);
        $this->actingAs($superAdmin)->get(route('admin.portfolios.show', $portfolio))->assertStatus(200);
    }
}
