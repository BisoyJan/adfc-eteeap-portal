<?php

namespace Tests\Feature\Admin;

use App\Models\Evaluation;
use App\Models\EvaluationScore;
use App\Models\Portfolio;
use App\Models\RubricCriteria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_can_view_reports(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.reports'));

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_view_reports(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $applicant = User::factory()->applicant()->create();

        $this->actingAs($evaluator)->get(route('admin.reports'))->assertStatus(403);
        $this->actingAs($applicant)->get(route('admin.reports'))->assertStatus(403);
    }

    public function test_reports_include_summary_stats(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->applicant()->count(3)->create();
        User::factory()->evaluator()->count(2)->create();
        Portfolio::factory()->count(5)->create();
        Portfolio::factory()->approved()->count(2)->create();

        $response = $this->actingAs($admin)->get(route('admin.reports'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/reports')
                ->has('summary')
                ->has('portfoliosByStatus')
                ->has('criteriaPerformance')
                ->has('evaluatorPerformance')
                ->has('recommendationBreakdown')
                ->has('monthlySubmissions')
        );
    }

    public function test_reports_include_criteria_performance(): void
    {
        $admin = User::factory()->admin()->create();
        $criteria = RubricCriteria::factory()->create(['max_score' => 20]);
        $evaluation = Evaluation::factory()->submitted()->create();
        EvaluationScore::factory()->create([
            'evaluation_id' => $evaluation->id,
            'rubric_criteria_id' => $criteria->id,
            'score' => 15,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.reports'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/reports')
                ->has('criteriaPerformance', 1)
        );
    }

    public function test_super_admin_can_view_reports(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)->get(route('admin.reports'));

        $response->assertStatus(200);
    }
}
