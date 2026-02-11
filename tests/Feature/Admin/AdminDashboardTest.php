<?php

namespace Tests\Feature\Admin;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_can_view_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }

    public function test_super_admin_can_view_admin_dashboard(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }

    public function test_evaluator_cannot_view_admin_dashboard(): void
    {
        $evaluator = User::factory()->evaluator()->create();

        $response = $this->actingAs($evaluator)->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    public function test_applicant_cannot_view_admin_dashboard(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    public function test_admin_dashboard_contains_stats(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->applicant()->count(3)->create();
        User::factory()->evaluator()->count(2)->create();
        Portfolio::factory()->submitted()->count(2)->create();
        Portfolio::factory()->count(1)->create(); // draft

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            $page->component('admin/dashboard')
                ->has('stats')
                ->has('portfoliosByStatus')
                ->has('recentSubmissions')
                ->has('evaluatorWorkload');
        });
    }

    public function test_dashboard_redirect_for_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertRedirect(route('admin.dashboard'));
    }
}
