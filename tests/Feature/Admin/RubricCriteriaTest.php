<?php

namespace Tests\Feature\Admin;

use App\Models\EvaluationScore;
use App\Models\RubricCriteria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RubricCriteriaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_can_view_rubric_criteria_list(): void
    {
        $admin = User::factory()->admin()->create();
        RubricCriteria::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.rubrics.index'));

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_view_rubric_criteria(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $applicant = User::factory()->applicant()->create();

        $this->actingAs($evaluator)->get(route('admin.rubrics.index'))->assertStatus(403);
        $this->actingAs($applicant)->get(route('admin.rubrics.index'))->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.rubrics.create'));

        $response->assertStatus(200);
    }

    public function test_admin_can_create_rubric_criteria(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.rubrics.store'), [
            'name' => 'Work Experience Relevance',
            'description' => 'Evaluates relevance of work experience.',
            'max_score' => 25,
            'sort_order' => 1,
        ]);

        $response->assertRedirect(route('admin.rubrics.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('rubric_criterias', [
            'name' => 'Work Experience Relevance',
            'max_score' => 25,
        ]);
    }

    public function test_admin_cannot_create_rubric_criteria_without_name(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.rubrics.store'), [
            'description' => 'Some description.',
            'max_score' => 10,
            'sort_order' => 0,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_admin_can_view_edit_form(): void
    {
        $admin = User::factory()->admin()->create();
        $criteria = RubricCriteria::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.rubrics.edit', $criteria));

        $response->assertStatus(200);
    }

    public function test_admin_can_update_rubric_criteria(): void
    {
        $admin = User::factory()->admin()->create();
        $criteria = RubricCriteria::factory()->create();

        $response = $this->actingAs($admin)->put(route('admin.rubrics.update', $criteria), [
            'name' => 'Updated Criteria Name',
            'description' => 'Updated description.',
            'max_score' => 30,
            'sort_order' => 5,
        ]);

        $response->assertRedirect(route('admin.rubrics.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('rubric_criterias', [
            'id' => $criteria->id,
            'name' => 'Updated Criteria Name',
            'max_score' => 30,
        ]);
    }

    public function test_admin_can_delete_rubric_criteria(): void
    {
        $admin = User::factory()->admin()->create();
        $criteria = RubricCriteria::factory()->create();

        $response = $this->actingAs($admin)->delete(route('admin.rubrics.destroy', $criteria));

        $response->assertRedirect(route('admin.rubrics.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('rubric_criterias', ['id' => $criteria->id]);
    }

    public function test_admin_cannot_delete_criteria_with_scores(): void
    {
        $admin = User::factory()->admin()->create();
        $criteria = RubricCriteria::factory()->create();
        EvaluationScore::factory()->create(['rubric_criteria_id' => $criteria->id]);

        $response = $this->actingAs($admin)->delete(route('admin.rubrics.destroy', $criteria));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('rubric_criterias', ['id' => $criteria->id]);
    }

    public function test_admin_can_toggle_criteria_active_status(): void
    {
        $admin = User::factory()->admin()->create();
        $criteria = RubricCriteria::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->post(route('admin.rubrics.toggle-active', $criteria));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('rubric_criterias', [
            'id' => $criteria->id,
            'is_active' => false,
        ]);
    }

    public function test_super_admin_can_manage_rubrics(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)->get(route('admin.rubrics.index'))->assertStatus(200);
        $this->actingAs($superAdmin)->get(route('admin.rubrics.create'))->assertStatus(200);
    }
}
