<?php

namespace Tests\Feature\Applicant;

use App\Enums\PortfolioStatus;
use App\Models\DocumentCategory;
use App\Models\Portfolio;
use App\Models\PortfolioDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_applicant_can_view_portfolios_list(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.index'));

        $response->assertStatus(200);
    }

    public function test_non_applicant_cannot_view_portfolios_list(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('applicant.portfolios.index'));

        $response->assertStatus(403);
    }

    public function test_guest_is_redirected_from_portfolios(): void
    {
        $response = $this->get(route('applicant.portfolios.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_applicant_can_view_create_form(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.create'));

        $response->assertStatus(200);
    }

    public function test_applicant_can_create_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->post(route('applicant.portfolios.store'), [
            'title' => 'My ETEEAP Portfolio',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('portfolios', [
            'user_id' => $applicant->id,
            'title' => 'My ETEEAP Portfolio',
            'status' => PortfolioStatus::Draft->value,
        ]);
    }

    public function test_applicant_can_view_own_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(200);
    }

    public function test_applicant_cannot_view_other_users_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();
        $otherApplicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $otherApplicant->id]);

        $response = $this->actingAs($applicant)->get(route('applicant.portfolios.show', $portfolio));

        $response->assertStatus(403);
    }

    public function test_applicant_can_update_draft_portfolio_title(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->put(route('applicant.portfolios.update', $portfolio), [
            'title' => 'Updated Portfolio Title',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('portfolios', [
            'id' => $portfolio->id,
            'title' => 'Updated Portfolio Title',
        ]);
    }

    public function test_applicant_cannot_update_submitted_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->submitted()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->put(route('applicant.portfolios.update', $portfolio), [
            'title' => 'Should Not Update',
        ]);

        $response->assertStatus(403);
    }

    public function test_applicant_can_delete_draft_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->delete(route('applicant.portfolios.destroy', $portfolio));

        $response->assertRedirect();

        $this->assertDatabaseMissing('portfolios', [
            'id' => $portfolio->id,
        ]);
    }

    public function test_applicant_cannot_delete_submitted_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->submitted()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->delete(route('applicant.portfolios.destroy', $portfolio));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('portfolios', [
            'id' => $portfolio->id,
        ]);
    }

    public function test_applicant_can_submit_portfolio_with_all_required_docs(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);

        $requiredCategories = DocumentCategory::factory()->required()->count(3)->create();

        foreach ($requiredCategories as $category) {
            PortfolioDocument::factory()->create([
                'portfolio_id' => $portfolio->id,
                'document_category_id' => $category->id,
            ]);
        }

        $response = $this->actingAs($applicant)->post(route('applicant.portfolios.submit', $portfolio));

        $response->assertRedirect(route('applicant.portfolios.index'));

        $portfolio->refresh();
        $this->assertEquals(PortfolioStatus::Submitted, $portfolio->status);
        $this->assertNotNull($portfolio->submitted_at);
    }

    public function test_applicant_cannot_submit_portfolio_without_required_docs(): void
    {
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);

        DocumentCategory::factory()->required()->count(3)->create();

        $response = $this->actingAs($applicant)->post(route('applicant.portfolios.submit', $portfolio));

        $response->assertSessionHasErrors('documents');

        $portfolio->refresh();
        $this->assertEquals(PortfolioStatus::Draft, $portfolio->status);
    }

    public function test_evaluator_cannot_access_applicant_routes(): void
    {
        $evaluator = User::factory()->evaluator()->create();

        $response = $this->actingAs($evaluator)->get(route('applicant.portfolios.index'));
        $response->assertStatus(403);

        $response = $this->actingAs($evaluator)->get(route('applicant.portfolios.create'));
        $response->assertStatus(403);

        $response = $this->actingAs($evaluator)->post(route('applicant.portfolios.store'), [
            'title' => 'Test',
        ]);
        $response->assertStatus(403);
    }
}
